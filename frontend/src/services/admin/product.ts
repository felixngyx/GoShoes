import axiosClient from '../../apis/axiosClient';
import { CATEGORY } from './category';

export type PRODUCT = {
	id: number;
	brand_id: number;
	name: string;
	description: string;
	price: number;
	stock_quantity: number;
	promotional_price: number;
	status: string;
	sku: string;
	is_deleted: number;
	rating_count: string;
	slug: string;
	thumbnail: string;
	hagtag: string;
	created_at: string;
	updated_at: string;
	variants: string;
};

export type PRODUCT_UPLOAD = {
	name: string;
	price: number;
	promotional_price: number;
	status: 'public' | 'unpublic' | 'hidden';
	sku: string;
	hagtag: string;
	stock_quantity: number;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	description: string;
	variants: {
		color_id: number;
		image_variant: string;
		sku: string;
		size: {
			size_id: number;
			quantity: number;
		}[];
	}[];
};

const productService = {
	getAll: async (page: number = 1, limit: number = 5): Promise<PRODUCT[]> => {
		const res = await axiosClient.get(
			`/products?page=${page}&limit=${limit}&order_by=created_at&order=desc`
		);
		return res.data.data;
	},
	getById: async (id: number): Promise<PRODUCT> => {
		const res = await axiosClient.get(`/productDetail/${id}`);
		return res.data.Data.product;
	},
	create: async (data: PRODUCT_UPLOAD): Promise<PRODUCT> => {
		const res = await axiosClient.post('/products', data);
		return res.data.Data;
	},
	update: async (id: number, data: PRODUCT_UPLOAD): Promise<PRODUCT> => {
		const res = await axiosClient.put(`/products/${id}`, data);
		return res.data.Data;
	},
	delete: async (id: number): Promise<PRODUCT> => {
		const res = await axiosClient.delete(`/products/${id}`);
		return res.data.Data;
	},
};

export default productService;
