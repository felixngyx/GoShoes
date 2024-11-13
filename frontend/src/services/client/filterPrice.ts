import axiosClient from "../../apis/axiosClient";

export const filterProduct = async (
  minPrice: number,
  maxPrice: number,
  limit: number
) => {
  try {
    const response = await axiosClient.get(
      `/products?minPrice=${minPrice}&maxPrice=${maxPrice}&limit=${limit}`
    );
    return response.data.data.products;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
