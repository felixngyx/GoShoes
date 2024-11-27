import axiosClient from "../../apis/axiosClient";

export const getAllProducts = async (page: number, limit: number) => {
  try {
    const response = await axiosClient.get(
      `/products?page=${page}&perPage=${limit}`
    );
    return response.data.data || [];
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};

export const getProductById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    console.error("Unknown error occurred:", error);

    return null;
  }
};

export const getAllRelatedProducts = async (id: number) => {
  try {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data.Data?.relatedProducts;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
};

export const getProductsByName = async (name: string) => {
  try {
    const response = await axiosClient.get(`/products?name=${name}`);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
};

export const checkStock = async (variant_id: number): Promise<number> => {
  try {
    const response = await axiosClient.get(
      `/product/variant/${variant_id}/stock`
    );
    return response.data.data.quantity;
  } catch (error) {
    console.error("Failed to check stock:", error);
    throw error;
  }
};

export const getProductByBrandId = async (brandId: number) => {
  try {
    const response = await axiosClient.get(`/products?brand_id=${brandId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products by brand ID:", error);
    throw new Error("Failed to fetch products by brand ID");
  }
};

export const getProductByCateId = async (CateId: number) => {
  try {
    const response = await axiosClient.get(`/products?category=${CateId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products by brand ID:", error);
    throw new Error("Failed to fetch products by brand ID");
  }
};
