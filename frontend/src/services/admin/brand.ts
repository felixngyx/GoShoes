import axiosClient from '../../apis/axiosClient';
import { BRAND } from '../../types/admin/brand';
const brandService = {
	getAll: () => {
		return axiosClient.get('/brands');
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
