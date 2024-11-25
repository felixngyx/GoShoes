import axiosClient from "../../apis/axiosClient";
import { Posts, SinglePostResponse, PostListResponse } from "../../types/admin/template/post";

// Get all posts
export const getAllPosts = async (page = 1) => {
  try {
    const response = await axiosClient.get(`/posts?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get post by id
export const getPostById = async (id: number): Promise<SinglePostResponse> => {
  try {
    const response = await axiosClient.get<SinglePostResponse>(`/posts/${id}`);
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
export const updatePost = async (id: number, data: FormData): Promise<SinglePostResponse> => {
  try {
    const response = await axiosClient.put<SinglePostResponse>(`/posts/${id}`, data, {
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
export const deletePost = async (id: number) => {
  try {
    const response = await axiosClient.delete(`/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}; 