import axiosClient from '../../apis/axiosClient';

export type PRODUCT = {
	id?: number;
	name: string;
	description: string;
	price: number;
	promotional_price: number;
	status: string;
	sku: string;
	hagtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	images: string[];
	stock_quantity: number;
	variants: {
		color: string;
		size_id: number;
		quantity: number;
		image_variant: string;
	}[];
};

const productService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(
			`/products?page=${page}&limit=${limit}&order_by=created_at&order=desc`
		);
	},
	getById: (id: number) => {
		return axiosClient.get(`/product/${id}`);
	},
	create: (data: PRODUCT) => {
		return axiosClient.post('/products', data);
	},
	update: (id: number, data: PRODUCT) => {
		return axiosClient.put(`/products/${id}`, data);
	},
	delete: (id: number) => {
		return axiosClient.delete(`/products/${id}`);
	},
};

export default productService;
