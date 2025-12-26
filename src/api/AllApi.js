import axios from "axios";

const url = "https://localhost:7064/api"

export const postExcel = async (files) => {
    const formData = new FormData()

    files.forEach(element => {
        formData.append("files", element)
    });

    const response = await axios.post(`${url}/upload-excel`, formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    )

    return response.data
}