import axiosClient from '../../apis/axiosClient';

export type PRODUCT = {
	id?: string;
	name: string;
	description: string;
	price: number;
	stock_quantity: number;
	promotional_price: number;
	status: string;
	sku: string;
	hashtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	images: string[];
	variants: {
		color: string;
		size_id: number;
		quantity: number;
		image_variant: string;
	}[];
};

const productService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/products?page=${page}&limit=${limit}`);
	},
	create: (data: PRODUCT) => {
		return axiosClient.post('/products', data);
	},
	update: (id: string, data: PRODUCT) => {
		return axiosClient.put(`/products/${id}`, data);
	},
	delete: (id: string) => {
		return axiosClient.delete(`/products/${id}`);
	},
};

export default productService;
