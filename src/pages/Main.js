import { useEffect, useState } from "react";
import { getAllAMCs, getAllPortfolioDisclosure, postExcel } from "../api/AllApi";

export default function Main() {
    const MAX_ROWS = 10;
    const [allAMCs, setAllAMCs] = useState([]); // Initialize as empty array
    const [allPortfolio, setAllPortfolio] = useState([]); // Initialize as empty array

    const fetchAllAmcs_PortfolioDisclosure = async () => {
        let res = await getAllAMCs();
        setAllAMCs(res || []);

        res = await getAllPortfolioDisclosure();
        setAllPortfolio(res || []);
    };

    useEffect(() => {
        fetchAllAmcs_PortfolioDisclosure();
    }, []);

    // Helper to generate a unique ID for keys
    const generateId = () => Date.now() + Math.random();

    // 1. Initialize with an ID
    const [rows, setRows] = useState([
        { id: generateId(), amc: "", portfolio: "", files: [] }
    ]);

    const addRow = () => {
        if (rows.length >= MAX_ROWS) {
            alert("Maximum 10 rows allowed");
            return;
        }

        // 2. Add ID when creating new row
        setRows([
            ...rows,
            { id: generateId(), amc: "", portfolio: "", files: [] }
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
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];

        // If user hits cancel in file dialog, selectedFiles might be empty
        if (selectedFiles.length === 0) return;

        for (let file of selectedFiles) {
            if (!allowedTypes.includes(file.type)) {
                alert(`Invalid file: ${file.name}`);
                e.target.value = null; // Clear input visually
                return;
            }
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

            // 3. Reset with a NEW unique ID
            // This forces React to destroy the old inputs and create fresh ones
            setRows([{ id: generateId(), amc: "", portfolio: "", files: [] }]);

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
                {/* 4. Use row.id as the key, NOT the index */}
                {rows.map((row, index) => (
                    <div className="flexbox" key={row.id}>

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