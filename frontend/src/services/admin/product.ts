import axiosClient from '../../apis/axiosClient';
import { CATEGORY } from './category';

export type PRODUCT = {
	name: string;
	description: string;
	price: number;
	stock_quantity: number;
	promotional_price: number;
	status: string;
	sku: string;
	hagtag: string;
	category_ids: number[];
	thumbnail: string;
	brand_id: number;
	variants: {
		color_id: number;
		size_id: number;
		quantity: number;
	}[];
	images: string[];
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
	brand_id: number;
	rating_count: number;
	status: string;
	thumbnail: string;
	images: {
		id?: number;
		image_path: string;
	}[];
	category_ids: number[];
	variants: {
		color_id: number;
		size_id: number;
		quantity: number;
	}[];
};

// export type PRODUCT_UPDATE = {
// 	id?: number;
// 	name: string;
// 	description: string;
// 	price: number;
// 	promotional_price: number;
// 	stock_quantity: number;
// 	sku: string;
// 	hagtag: string;
// 	brand_id: number;
// 	status: string;
// 	thumbnail: string;
// 	images: {
// 		id?: number;
// 		image_path: string;
// 	}[];
// 	category_ids: number[];
// 	variants?: {
// 		color_id: number;
// 		size_id: number;
// 		quantity: number;
// 	}[];
// };

const productService = {
	getAll: (page: number = 1, limit: number = 5) => {
		return axiosClient.get(
			`/products?page=${page}&limit=${limit}&order_by=created_at&order=desc`
		);
	},
	getById: async (id: number): Promise<PRODUCT_DETAIL> => {
		const res = await axiosClient.get(`/productDetail/${id}`);
		return res.data.Data.product;
	},
	create: (data: PRODUCT) => {
		return axiosClient.post('/products', data);
	},
	update: (id: number, data: PRODUCT_DETAIL) => {
		return axiosClient.put(`/products/${id}`, data);
	},
	delete: (id: number) => {
		return axiosClient.delete(`/products/${id}`);
	},
};

export default productService;
