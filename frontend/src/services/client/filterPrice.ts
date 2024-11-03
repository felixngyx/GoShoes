import axiosClient from "../../apis/axiosClient";

export const filterProduct = async (
  minPrice: number,
  maxPrice: number,
  limit: number
) => {
  console.log("Calling API with:", minPrice, maxPrice, limit);
  try {
    const response = await axiosClient.get(
      `/products?min_price=${minPrice}&max_price=${maxPrice}&limit=${limit}`
    );
    console.log("API Response:", response.data);
    return response.data.data.data; // Trả về phần 'data' chứa sản phẩm
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
