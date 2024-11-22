import axiosClient from "../../apis/axiosClient";
import { Posts } from "../../types/admin/template/post";

interface PostResponse {
  data: Posts[];
  // thêm các field khác nếu API trả về
  message?: string;
  status?: number;
}

// Get all posts
export const getAllPosts = async () => {
  try {
    const response = await axiosClient.get<PostResponse>('/posts');
    // Trả về response.data.data nếu API của bạn wrap data trong một object
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Get post by id
export const getPostById = async (id: number): Promise<Posts> => {
  try {
    const response = await axiosClient.get(`/posts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new post
export const createPost = async (data: FormData): Promise<Posts> => {
  try {
    const response = await axiosClient.post('/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update post
export const updatePost = async (id: number, data: FormData): Promise<Posts> => {
  try {
    const response = await axiosClient.put(`/posts/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete post
export const deletePost = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/posts/${id}`);
  } catch (error) {
    throw error;
  }
}; 