import { useEffect, useState } from "react";
import { getAllAMCs, getAllPortfolioDisclosure, postExcel } from "../api/AllApi";

export default function Main() {
    const MAX_ROWS = 10;
    const [allAMCs, setAllAMCs] = useState([]); // Initialize as empty array
    const [allPortfolio, setAllPortfolio] = useState([]); // Initialize as empty array

    const [loading, setLoading] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");

    // const [warnings, setWarnings] = useState([]);
    const [logUrl, setLogUrl] = useState("");

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
            setLoading(true);
            setUploadPercent(0);
            setStatusMessage("Uploading Files...");
            // setWarnings([]);
            setLogUrl("");
            // const res = await postExcel(rows);
            // alert(res.message);

            // // 3. Reset with a NEW unique ID
            // // This forces React to destroy the old inputs and create fresh ones
            // setRows([{ id: generateId(), amc: "", portfolio: "", files: [] }]);

            // 🟢 2. Call the function with the progress callback
            const response = await postExcel(rows, (percent) => {
                setUploadPercent(percent);

                // Visual feedback change when upload hits 100% but server is still thinking
                if (percent === 100) {
                    setStatusMessage("Processing Excel Data... Please wait.");
                }
            });

            if (response.logDetailsUrl) {
                setLogUrl(response.logDetailsUrl);
            }

            // if (response.warnings && response.warnings.length > 0) {
            //     setStatusMessage("Completed with Warnings");
            //     setWarnings(response.warnings); // Save to state
            //     alert(`Process finished, but ${response.warnings.length} funds were missing. Check the list below.`);
            // } else {
            //     setStatusMessage("Upload Successful!");
            //     setRows([{ id: generateId(), amc: "", portfolio: "", files: [] }]);

            //     alert("All files processed successfully!");
            // }

        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            // Reset loading state (optionally keep success message)
            setLoading(false);
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

            {/* 🟢 3. The Loader / Progress Bar UI */}
            {loading && (
                <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>

                    {/* Text Status */}
                    <p><strong>{statusMessage}</strong></p>

                    {/* Progress Bar Container */}
                    <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "5px" }}>
                        {/* Progress Bar Fill */}
                        <div
                            style={{
                                width: `${uploadPercent}%`,
                                backgroundColor: uploadPercent < 100 ? "#3b82f6" : "#22c55e", // Blue -> Green
                                height: "20px",
                                borderRadius: "5px",
                                transition: "width 0.3s ease",
                                textAlign: "center",
                                color: "white",
                                fontSize: "12px",
                                lineHeight: "20px"
                            }}
                        >
                            {uploadPercent}%
                        </div>
                    </div>

                    {uploadPercent === 100 && (
                        <p style={{ fontSize: "12px", color: "#666" }}>
                            (Server is extracting data from Excel, this might take a moment...)
                        </p>
                    )}
                </div>
            )}

            {/* 🟢 NEW: Warning List Section */}
            {/* {!loading && warnings.length > 0 && ( */}
            {/* // <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #f5c6cb", backgroundColor: "#f8d7da", borderRadius: "5px", color: "#721c24" }}>
                    // <h4>⚠️ Processed with Warnings:</h4>
                    // <p>The following funds were not found in the Master Database and were skipped:</p>
                //     <ul style={{ paddingLeft: "20px", marginTop: "10px", maxHeight: "200px", overflowY: "auto" }}> */}
            {/* //         {warnings.map((warn, idx) => ( */}
            {/* //             <li key={idx} style={{ fontSize: "13px", marginBottom: "5px" }}> */}
            {/* //                 {warn} */}
            {/* //             </li> */}
            {/* //         ))} */}
            {/* //     </ul> */}
            {/* // </div> */}
            {/* // )} */}

            {/* 🟢 3. LOG FILE LINK SECTION */}
            {!loading && logUrl && (
                <div style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "5px",
                    color: "#0284c7"
                }}>
                    <p style={{ margin: 0 }}>
                        📄 <strong>Execution Logs:</strong>{" "}
                        <a
                            href={logUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0369a1", textDecoration: "underline", fontWeight: "bold" }}
                        >
                            View/Download Log File
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}