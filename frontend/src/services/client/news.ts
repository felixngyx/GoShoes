import axiosClient from "../../apis/axiosClient";

export const getAllNews = async () => {
  try {
    const { data } = await axiosClient.get("/posts");
    return data?.data?.posts || [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

export const getNewsById = async (id: number) => {
  try {
    const response = await axiosClient.get(`/posts/${id}`);
    if (response.data?.success) {
      return response.data?.post || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
};
