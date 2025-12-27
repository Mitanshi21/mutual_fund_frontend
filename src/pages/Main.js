import { useEffect, useState } from "react";
import { postExcel } from "../api/AllApi";

export default function Main() {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
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
                setFiles([]);
                return;
            }
            validFiles.push(file);
        }

        setFiles(validFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length == 0) {
            alert("Select Files..");
            return
        }

        try {
            console.log("Selected files:", files);

            const res = await postExcel(files);
            console.log("res:" + res.message);

            alert(res.message);
        } catch (error) {
            console.log("Error While Fetching the Files:", error);
            alert("Upload Failed!!")
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload AMC File</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Upload File</label>
                    <input type="file" multiple onChange={handleFileChange} required accept=".xls,.xlsx" />
                </div>

                <button className="submit-btn" type="submit">
                    Upload
                </button>
            </form>
        </div>
    );
}
