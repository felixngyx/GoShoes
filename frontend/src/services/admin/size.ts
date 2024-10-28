import axiosClient from '../../apis/axiosClient';

export type SIZE = {
	id?: string;
	size: string;
	code: string;
	created_at: string;
	updated_at: string;
};

const sizeService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/sizes?page=${page}&limit=${limit}`);
	},
	create: (size: SIZE) => {
		return axiosClient.post('/sizes', size);
	},
	update: (id: string, size: SIZE) => {
		return axiosClient.put(`/sizes/${id}`, size);
	},
	delete: (id: string) => {
		return axiosClient.delete(`/sizes/${id}`);
	},
};

export default sizeService;
