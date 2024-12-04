import axiosClient from "../../apis/axiosClient";

export const getAllCategories = async (limit: number, page: number) => {
  try {
    const response = await axiosClient.get(
      `/categories?limit=${limit}&page=${page}`
    );
    return response.data.categories;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
