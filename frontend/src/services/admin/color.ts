import axiosClient from '../../apis/axiosClient';

export type COLOR = {
	id?: number;
	color: string;
	link_image: string;
	created_at?: string;
	updated_at?: string;
};

const colorService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/colors?page=${page}&limit=${limit}`);
	},

	create: (data: COLOR) => {
		return axiosClient.post('/colors', data);
	},

	update: (id: number, data: COLOR) => {
		return axiosClient.put(`/colors/${id}`, data);
	},

	delete: (id: number) => {
		return axiosClient.delete(`/colors/${id}`);
	},
};

export default colorService;
