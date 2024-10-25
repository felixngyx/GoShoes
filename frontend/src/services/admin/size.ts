import axiosClient from '../../apis/axiosClient';

const sizeService = {
	getAll: () => {
		return axiosClient.get('/sizes');
	},
	create: (size: { name: string }) => {
		return axiosClient.post('/sizes', size);
	},
	update: (id: string, size: { name: string }) => {
		return axiosClient.put(`/sizes/${id}`, size);
	},
	delete: (id: string) => {
		return axiosClient.delete(`/sizes/${id}`);
	},
};

export default sizeService;
