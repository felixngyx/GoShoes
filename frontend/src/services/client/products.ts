import axiosClient from "../../apis/axiosClient";

export const getAllProducts = async (page: number, limit: number) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/products?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();

    // Kiểm tra xem dữ liệu có đúng định dạng không
    if (!result.data || !Array.isArray(result.data.data)) {
      console.warn("Unexpected response structure:", result);
      return { data: [] }; // Trả về cấu trúc mặc định nếu không đúng
    }

    return result.data; // Trả về dữ liệu đúng
  } catch (err) {
    console.error("An error occurred:", err);
    return null;
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
