import axios from "axios";

const url = "https://localhost:7067/api"

export const postExcel = async (rows) => {
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
        formData
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