import axiosClient from '../../apis/axiosClient';

export interface CATEGORY {
	id: number;
	name: string;
	products_count: number;
}

export interface CategoryResponse {
	message: string;
	categories: {
		current_page: number;
		data: CATEGORY[];
		first_page_url: string;
		from: number;
		last_page: number;
		last_page_url: string;
		next_page_url: string | null;
		path: string;
		per_page: number;
		prev_page_url: string | null;
		to: number;
		total: number;
		links: {
			url: string | null;
			label: string;
			active: boolean;
		}[];
	}
}

const categoryService = {
	getAll: (page: number = 1, limit: number = 15) => {
		return axiosClient.get<CategoryResponse>(`/categories?page=${page}&limit=${limit}`);
	},
	create: (data: Partial<CATEGORY>) => {
		return axiosClient.post('/categories', data);
	},
	update: (id: number, data: Partial<CATEGORY>) => {
		return axiosClient.put(`/categories/${id}`, data);
	},
	delete: (id: number) => {
		return axiosClient.delete(`/categories/${id}`);
	},
};

export default categoryService;
