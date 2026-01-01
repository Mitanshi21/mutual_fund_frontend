import axios from "axios";

const url = "https://localhost:7067/api"

export const postExcel = async (rows, onProgress) => {
    const formData = new FormData();

    rows.forEach((row, index) => {
        formData.append(`rows[${index}].amc_id`, row.amc);
        formData.append(`rows[${index}].portfolio_type_id`, row.portfolio);

        row.files.forEach(file => {
            formData.append(`rows[${index}].files`, file);
        });
    });

    const res = await axios.post(
        `${url}/FileUpload/upload-excel`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            // 🟢 Axios native event for upload progress
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    onProgress(percentCompleted);
                }
            },
        }
    );

    return res.data;
};


export const getAllAMCs = async () => {
    const res = await axios.get(`${url}/AMCs`)
    return res.data
}

export const getAllPortfolioDisclosure = async () => {
    const res = await axios.get(`${url}/PortfolioDisclosure`)
    return res.data
}