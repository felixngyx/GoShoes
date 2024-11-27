import axiosClient from "../../apis/axiosClient";

export const filterProduct = async (
  price_from: number,
  price_to: number,
  limit: number,
  sortByName?: "asc" | "desc",
  sortByPrice?: "asc" | "desc",
  sortByRating?: "asc" | "desc"
) => {
  try {
    const params: Record<string, string | number> = {
      price_from,
      price_to,
      limit,
    };

    if (sortByName) params["sortByName"] = sortByName;
    if (sortByPrice) params["sortByPrice"] = sortByPrice;
    if (sortByRating) params["sortByRating"] = sortByRating;

    const response = await axiosClient.get("/products", { params });

    return response.data.data;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
