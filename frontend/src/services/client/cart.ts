import axiosClient from "../../apis/axiosClient";

export const getListCart = async () => {
  try {
    const response = await axiosClient.get("/cart");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};
