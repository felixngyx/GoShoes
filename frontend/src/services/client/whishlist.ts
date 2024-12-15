import axiosClient from "../../apis/axiosClient";

export interface ProductParams {
  product_id: number;
}

// Thêm sản phẩm vào danh sách yêu thích
export const addProductToWishlist = async (params: ProductParams) => {
  try {
    const response = await axiosClient.post("/wishlist", params);
    
    if (response.status === 200) {
      return { success: true, message: 'Sản phẩm đã có trong danh sách yêu thích' };
    } else if (response.status === 201) {
      return { success: true, message: 'Sản phẩm đã được thêm vào danh sách yêu thích' };
    }
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm vào danh sách yêu thích:', error);
    throw error;
  }
};

// Lấy các sản phẩm trong danh sách yêu thích
export const getWishlist = async () => {
  try {
    const response = await axiosClient.get("/wishlist");
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu thích:", error);
    throw error;
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
export const deleteProductFromWishlist = async (productId: number) => {
  try {
    const response = await axiosClient.delete(`/wishlist`, {
      data: { product_id: productId },
    });

    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích:", error);
    throw error;
  }
};
