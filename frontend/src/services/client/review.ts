import axiosClient from "../../apis/axiosClient";

export const submitReview = async (
  productId: number,
  rating: number,
  comment: string
) => {
  try {
    const response = await axiosClient.post("/reviews", {
      product_id: productId,
      rating,
      comment,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to submit review");
  }
};
