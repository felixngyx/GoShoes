import axiosClient from "../../apis/axiosClient";

export const getAllShipping = async () => {
  try {
    const response = await axiosClient.get(`/shipping`);
    const shippingData = response.data.data.flat().map((item: any) => ({
      ...item,
      shipping_detail:
        typeof item.shipping_detail === "string"
          ? JSON.parse(item.shipping_detail)
          : item.shipping_detail,
    }));

    return shippingData;
  } catch (error) {
    console.error("Failed to get shipping options:", error);
    throw error;
  }
};

export const createShipping = async (data: any) => {
  try {
    const response = await axiosClient.post(`/shipping`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to create new shipping option:", error);
    throw error;
  }
};

export const updateShipping = async (id: number, data: any) => {
  try {
    const response = await axiosClient.put(`/shipping/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update shipping option:", error);
    throw error;
  }
};

export const deleteShipping = async (id: number) => {
  try {
    await axiosClient.delete(`/shipping/${id}`);
  } catch (error) {
    console.error("Failed to delete shipping option:", error);
    throw error;
  }
};
