import axios from "axios";

const url = "https://localhost:7064/api"

export const postExcel = async (files) => {
    const formData = new FormData()

    files.forEach(element => {
        formData.append("files", element)
    });

    const response = await axios.post(`${url}/AMCs/upload-excel`, formData)

    return response.data
}