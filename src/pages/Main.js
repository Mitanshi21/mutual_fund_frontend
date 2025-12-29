import { useEffect, useState } from "react";
import { getAllAMCs, getAllPortfolioDisclosure, postExcel } from "../api/AllApi";

export default function Main() {
    const MAX_ROWS = 10;
    const [allAMCs, setAllAMCs] = useState();
    const [allPortfolio, setAllPortfolio] = useState();

    const fetchAllAmcs_PortfolioDisclosure = async () => {
        let res = await getAllAMCs();
        setAllAMCs(res)
        // console.log(res);

        res = await getAllPortfolioDisclosure()
        setAllPortfolio(res)
    }

    useEffect(() => {
        fetchAllAmcs_PortfolioDisclosure()
    }, [])


    const [rows, setRows] = useState([
        { amc: "", portfolio: "", files: [] }
    ]);

    const addRow = () => {
        if (rows.length >= MAX_ROWS) {
            alert("Maximum 10 rows allowed");
            return;
        }

        setRows([
            ...rows,
            { amc: "", portfolio: "", files: [] }
        ]);
    };
    const removeRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleRowChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;
        setRows(updated);
    };

    const handleFileChange = (index, e) => {
        const selectedFiles = Array.from(e.target.files);

        const allowedTypes = [
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
        ];

        const validFiles = [];

        for (let file of selectedFiles) {
            if (!allowedTypes.includes(file.type)) {
                alert(`Invalid file: ${file.name}`);
                e.target.value = null;
                return;
            }
            validFiles.push(file);
        }

        const updated = [...rows];
        updated[index].files = selectedFiles;
        setRows(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        for (let r of rows) {
            if (!r.amc || !r.portfolio || r.files.length === 0) {
                alert("Please fill all fields in every row");
                return;
            }
        }

        try {
            const res = await postExcel(rows);
            alert(res.message);

            // reset
            setRows([{ amc: "", portfolio: "", files: [] }]);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };


    return (
        <div className="upload-container">
            <h2>Upload AMC Portfolio Files</h2>
            <hr />
            <form onSubmit={handleSubmit}>
                {rows.map((row, index) => (
                    <div className="flexbox" key={index}>

                        <div className="form-group">
                            <label>Select AMC:</label>
                            <select
                                value={row.amc}
                                onChange={e => handleRowChange(index, "amc", e.target.value)}
                            >
                                <option value="">--Select AMC--</option>
                                {allAMCs?.map(a => (
                                    <option key={a.id} value={a.id}>{a.amcname}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Select Portfolio Closure:</label>
                            <select
                                value={row.portfolio}
                                onChange={e => handleRowChange(index, "portfolio", e.target.value)}
                            >
                                <option value="">--Select Portfolio--</option>
                                {allPortfolio?.map(p => (
                                    <option key={p.id} value={p.id}>{p.portfolio_type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Upload Files:</label>
                            <input
                                type="file"
                                multiple
                                accept=".xls,.xlsx"
                                onChange={e => handleFileChange(index, e)}
                            />
                        </div>

                        <div className="form-group">
                            <div>&nbsp;</div>
                            {rows.length > 1 && (
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeRow(index)}
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: "20px" }}>
                    <button type="button" className="add-btn" onClick={addRow}>
                        Add Row
                    </button>

                    <button type="submit" className="submit-btn">
                        Upload
                    </button>
                </div>
            </form>


        </div>
    );
}
