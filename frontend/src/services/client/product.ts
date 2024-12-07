import axiosClient from "../../apis/axiosClient";

export const getAllProducts = async (page: number, limit: number) => {
  try {
    const response = await axiosClient.get(
      `/products?page=${page}&perPage=${limit}&status=public`
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
    const response = await axiosClient.get(
      `/products?brand_id=${id}&status=public`
    );
    return response.data.data;
  } catch (error) {
    console.error("An error occurred:", error);
    return [];
  }
};

export const getProductsByName = async (name: string) => {
  try {
    const response = await axiosClient.get(
      `/products?name=${name}&status=public`
    );

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

export const getProductByBrandId = async (
  brandId: number,
  page: number,
  perPage: number
) => {
  try {
    const response = await axiosClient.get(
      `/products?brand_id=${brandId}&page=${page}&perPage=${perPage}&status=public`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products by brand ID:", error);
    throw new Error("Failed to fetch products by brand ID");
  }
};

export const getProductByCateId = async (
  CateId: number,
  page: number,
  perPage: number
) => {
  try {
    const response = await axiosClient.get(
      `/products?category_id=${CateId}&page=${page}&perPage=${perPage}&status=public`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products by brand ID:", error);
    throw new Error("Failed to fetch products by brand ID");
  }
};

export const getAllSizes = async () => {
  try {
    const response = await axiosClient.get("/sizes");
    return response.data.sizes.data;
  } catch (error) {
    console.error("Failed to get all sizes:", error);
    throw error;
  }
};

export const getProductsHomeCustom = async () => {
  try {
    const response = await axiosClient.get("/client/homecustom");
    return response.data;
  } catch (error) {
    console.error("Failed to get all:", error);
    throw error;
  }
};
