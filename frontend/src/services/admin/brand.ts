import axiosClient from '../../apis/axiosClient';

export interface BRAND {
	id?: number;
	name: string;
	slug?: string;
	logo_url: string;
	created_at?: string;
	updated_at?: string;
	products_count?: number;
	average_rating?: string;
}

export interface BrandResponse {
	status: string;
	message: string;
	data: {
		brands: BRAND[];
		pagination: {
			total: number;
			per_page: number;
			current_page: number;
			last_page: number;
			from: number;
			to: number;
		};
	};
}

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
