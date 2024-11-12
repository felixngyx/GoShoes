import axiosClient from "../../apis/axiosClient";
import Cookies from "js-cookie";

interface UpdateCartQuantityParams {
  product_variant_id: number;
  quantity: number;
}

export const getListCart = async () => {
  try {
    const accessToken = Cookies.get("access_token");
    if (!accessToken) {
      throw new Error("Access token không tồn tại");
    }
    const response = await axiosClient.get("/cart", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giỏ hàng:", error);
    throw error;
  }
};

export const updateCartQuantity = async (params: UpdateCartQuantityParams) => {
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
