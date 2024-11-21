import axiosClient from '../../apis/axiosClient';
import { CATEGORY } from './category';

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
		color: string; // Red, Blue, Green
		size_id: number; // 1, 2, 3
		quantity: number; // 10, 20, 30
		image_variant: string; // https://res.cloudinary.com/dxxwcby8z/image/upload/v1716262513/product/1726764884888_1726764884888.jpg
	}[];
};

export type Variant = {
	size_id: number;
	color_id: number;
	size: number;
	color: string;
	quantity: number;
	image_variant: string;
};

export type PRODUCT_DETAIL = {
	id?: number;
	name: string;
	description: string;
	price: number;
	promotional_price: number;
	stock_quantity: number;
	sku: string;
	hagtag: string;
	brand: number;
	status: string;
	thumbnail: string;
	images: {
		id: number;
		image_path: string;
	}[];
	categories: CATEGORY[];
	variants?: Variant[];
};

export type PRODUCT_UPDATE = {
	id?: number;
	name: string;
	description: string;
	price: number;
	promotional_price: number;
	stock_quantity: number;
	sku: string;
	hagtag: string;
	brand_id: number;
	status: string;
	thumbnail: string;
	images: {
		id?: number;
		image_path: string;
	}[];
	category_ids: number[];
	variants?: {
		color_id: number;
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
	getById: async (id: number) => {
		const res = await axiosClient.get(`/productDetail/${id}`);
		return res.data.Data.product;
	},
	create: (data: PRODUCT) => {
		return axiosClient.post('/products', data);
	},
	update: (id: number, data: PRODUCT_UPDATE) => {
		return axiosClient.put(`/products/${id}`, data);
	},
	delete: (id: number) => {
		return axiosClient.delete(`/products/${id}`);
	},
};

export default productService;
