import axiosClient from '../../apis/axiosClient';

export type BRAND = {
	id?: string;
	name: string;
};

const brandService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/brands?page=${page}&limit=${limit}`);
	},

	create: (data: BRAND) => {
		return axiosClient.post('/brands', data);
	},
	update: (id: string, data: BRAND) => {
		return axiosClient.put(`/brands/${id}`, data);
	},
	delete: (id: string) => {
		return axiosClient.delete(`/brands/${id}`);
	},
};

export default brandService;
