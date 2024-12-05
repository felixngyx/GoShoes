import axiosClient from '../../apis/axiosClient';
import { CATEGORY } from './category';

// type Variant = {
// 	color_id: number;
// 	image: string;
// 	variant_details: [
// 		{
// 			size_id: number;
// 			quantity: number;
// 			sku: string;
// 		}[]
// 	];
// };

// export type PRODUCT = {
// 	id: number;
// 	brand_id: number;
// 	name: string;
// 	description: string;
// 	price: number;
// 	stock_quantity: number;
// 	promotional_price: number;
// 	status: string;
// 	sku: string;
// 	is_deleted: number;
// 	rating_count: string;
// 	slug: string;
// 	thumbnail: string;
// 	hagtag: string;
// 	created_at: string;
// 	updated_at: string;
// };

export interface PRODUCT {
	id?: number;
	name: string;
	price: number;
	promotional_price: number;
	status: string;
	sku: string;
	hagtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	updated_at?: string;
	description: string;
	stock_quantity?: number;
	created_at?: string;
	variants: {
		color_id: number;
		image: string;
		variant_details: {
			size_id: number;
			quantity: number;
			sku: string;
			product_variant_id?: number;
		}[];
	}[];
}

export interface PRODUCT_DETAIL {
	id?: number;
	name: string;
	price: number;
	promotional_price: number;
	status: string;
	sku: string;
	hagtag: string;
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	description: string;
	stock_quantity?: number;
	variants: {
		color_id: number;
		image: string;
		sizes: {
			size_id: number;
			quantity: number;
			product_variant_id?: number;
		}[];
	}[];
}

export interface PRODUCT_UPDATE {
	name: string;
	price: number;
	promotional_price: number;
	status: string;
	sku: string;
	hagtag: string;
	categories?: number[];
	category_ids: number[];
	brand_id: number;
	thumbnail: string;
	description: string;
	stock_quantity?: number;
	variants: {
		color_id: number;
		image: string;
		variant_details: {
			size_id: number;
			quantity: number;
			sku: string;
			product_variant_id?: number;
		}[];
	}[];
}

const productService = {
	getAll: async (
		page: number = 1,
		limit: number = 1,
		orderBy: string = 'created_at',
		sortBy: string = 'DESC'
	) => {
		return await axiosClient.get(
			`/products?page=${page}&perPage=${limit}&orderBy=${orderBy}&sortBy=${sortBy}`
		);
	},
	getById: async (id: number) => {
		return await axiosClient.get(`/products/${id}`);
	},
	create: async (data: PRODUCT) => {
		return await axiosClient.post('/products', data);
	},
	update: async (id: number, data: PRODUCT_UPDATE): Promise<PRODUCT> => {
		return await axiosClient.put(`/products/${id}`, data);
	},
	delete: async (id: number): Promise<PRODUCT> => {
		const res = await axiosClient.delete(`/products/${id}`);
		return res.data.Data;
	},
};

export default productService;
