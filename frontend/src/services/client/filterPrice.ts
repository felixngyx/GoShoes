import axiosClient from "../../apis/axiosClient";

export const filterProduct = async (
  minPrice: number,
  maxPrice: number,
  limit: number,
  sortByName?: "asc" | "desc",
  sortByPrice?: "asc" | "desc",
  sortByRating?: "asc" | "desc"
) => {
  try {
    const params: Record<string, string | number> = {
      minPrice,
      maxPrice,
      limit,
    };

    if (sortByName) params["sortByName"] = sortByName;
    if (sortByPrice) params["sortByPrice"] = sortByPrice;
    if (sortByRating) params["sortByRating"] = sortByRating;

    const response = await axiosClient.get("/products", { params });

    return response.data.data.products;
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return [];
  }
};
