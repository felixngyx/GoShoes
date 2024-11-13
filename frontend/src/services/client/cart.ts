import axiosClient from "../../apis/axiosClient";

export interface CartParams {
  product_variant_id: number;
  quantity: number;
}

export const addToCart = async (params: CartParams) => {
  try {
    const response = await axiosClient.post("/cart", params);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    throw error;
  }
};

export const getListCart = async () => {
  try {
    const response = await axiosClient.get("/cart");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giỏ hàng:", error);
    throw error;
  }
};

export const updateCartQuantity = async (params: CartParams) => {
  try {
    const response = await axiosClient.put("/cart", params);
    return response.data;
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    throw error;
  }
};

export const deleteCartItem = async (productVariantId: number) => {
  try {
    const response = await axiosClient.delete(`/cart`, {
      data: { product_variant_id: productVariantId },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to delete cart item:", error);
    throw error;
  }
};
