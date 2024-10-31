import axiosClient from '../../apis/axiosClient';

export type CATEGORY = {
	id?: string;
	name: string;
};

const categoryService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/categories?page=${page}&limit=${limit}`);
	},
	create: (data: CATEGORY) => {
		return axiosClient.post('/categories', data);
	},
	update: (id: string, data: CATEGORY) => {
		return axiosClient.put(`/categories/${id}`, data);
	},
	delete: (id: string) => {
		return axiosClient.delete(`/categories/${id}`);
	},
};

export default categoryService;
