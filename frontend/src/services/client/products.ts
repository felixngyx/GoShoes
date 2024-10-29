import axiosClient from "../../apis/axiosClient";
import { IProduct } from "../../types/client/products/products";

export const getAllProducts = async (
  page: number,
  limit: number
): Promise<IProduct[]> => {
  try {
    const response = await axiosClient.get(
      `/products?page=${page}&limit=${limit}`
    );
    return response.data.product.data;
  } catch (error: unknown) {
    console.error("Error in getAllProducts:", error);
    return [];
  }
};

export const getProductById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data.product;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return null;
  }
};
