import axiosClient from '../../apis/axiosClient';

export interface POST_CATEGORY {
	id: number;
	name: string;
}

const postCategoryService = {
	getAll: async ({
		page = 1,
		limit = 5,
	}: {
		page?: number;
		limit?: number;
	}) => {
		return axiosClient.get(`/post-categories?page=${page}&limit=${limit}`);
	},

	create: async (data: POST_CATEGORY): Promise<POST_CATEGORY> => {
		const res = await axiosClient.post('/post-categories', data);
		return res.data.data;
	},

	update: async (id: number, data: POST_CATEGORY): Promise<POST_CATEGORY> => {
		const res = await axiosClient.put(`/post-categories/${id}`, data);
		return res.data.data;
	},

	delete: async (id: number): Promise<POST_CATEGORY> => {
		const res = await axiosClient.delete(`/post-categories/${id}`);
		return res.data.data;
	},
};

export default postCategoryService;
