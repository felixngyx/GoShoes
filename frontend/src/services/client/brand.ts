import axiosClient from "../../apis/axiosClient";

export const getAllBrands = async () => {
  try {
    const response = await axiosClient.get("/brands");
    return response.data.data.brands || [];
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
};
