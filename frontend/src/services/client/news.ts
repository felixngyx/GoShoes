import axiosClient from "../../apis/axiosClient";

export const getAllNews = async (page = 1) => {
  try {
    const response = await axiosClient.get(`/posts?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
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
