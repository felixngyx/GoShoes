import axiosClient from "../../apis/axiosClient";

export const getAllBrands = async (limit: number, page: number) => {
  try {
    const response = await axiosClient.get(
      `/brands?limit=${limit}&page=${page}`
    );
    return response.data.data || [];
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
};
