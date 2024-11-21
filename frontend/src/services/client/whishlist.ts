import axiosClient from "../../apis/axiosClient";

export interface ProductParams {
  product_id: number;
}

// Add product to wishlist
export const addProductToWishlist = async (params: ProductParams) => {
  try {
    const response = await axiosClient.post("/wishlist", params);
    
    if (response.status === 200) {
      return { success: true, message: 'Product already in wishlist' };
    } else if (response.status === 201) {
      return { success: true, message: 'Product added to wishlist' };
    }
    return response.data.data;
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    throw error;
  }
};

// Get wishlist items
export const getWishlist = async () => {
  try {
    const response = await axiosClient.get("/wishlist");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

// Delete product from wishlist
export const deleteProductFromWishlist = async (productId: number) => {
  try {
    const response = await axiosClient.delete(`/wishlist`, {
      data: { product_id: productId },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error deleting product from wishlist:", error);
    throw error;
  }
};