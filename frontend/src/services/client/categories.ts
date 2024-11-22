import axiosClient from "../../apis/axiosClient";

export const getAllCategories = async () => {
  try {
    const response = await axiosClient.get(`/categories`);
    return response.data.categories.data;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
