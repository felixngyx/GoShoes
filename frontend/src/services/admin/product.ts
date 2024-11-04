import axiosClient from '../../apis/axiosClient';
import { CATEGORY } from './category';
import { SIZE } from './size';

type Color = {
	color: string;
	id: number;
	link_image: string;
	created_at: string;
	updated_at: string;
};

type Variant = {
	id: number;
	color_id: number;
	color?: Color;
	size_id: number;
	size?: SIZE;
	quantity: number;
	image_variant: string | File;
	created_at: string;
	updated_at: string;
};

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
	categories?: CATEGORY[];
	brand_id: number;
	thumbnail: string | File;
	images: string[] | File[];
	variants?:
		| {
				color: string;
				size_id: number;
				quantity: number;
				image_variant: string | File;
		  }[]
		| Variant[];
};

const productService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(`/products?page=${page}&limit=${limit}`);
	},
	getById: (id: number) => {
		return axiosClient.get(`/products/${id}`);
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
