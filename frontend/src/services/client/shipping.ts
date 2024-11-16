import axiosClient from "../../apis/axiosClient";

export const getAllShipping = async () => {
  try {
    const response = await axiosClient.get(`/shipping`);
    const shippingData = response.data.data.flat();
    return shippingData;
  } catch (error) {
    console.error("Failed to get shipping options:", error);
    throw error;
  }
};
