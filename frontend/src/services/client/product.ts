import axiosClient from '../../apis/axiosClient';
import { IProduct } from '../../types/client/products/products';

export const getAllProducts = async (page: number, limit: number) => {
	try {
		const response = await axiosClient.get(
			`/products?page=${page}&limit=${limit}`
		);
		return response.data.data.products || [];
	} catch (error: unknown) {
		console.error('An error occurred:', error);
		return [];
	}
};

export const getProductById = async (id: number) => {
	try {
		const response = await axiosClient.get(`/product/${id}`);
		return response.data.product?.product;
	} catch (error: unknown) {
		console.error('Unknown error occurred:', error);

		return null;
	}
};

export const getAllRelatedProducts = async (id: number) => {
	try {
		const response = await axiosClient.get(`/products/${id}`);
		return response.data.Data?.relatedProducts;
	} catch (error) {
		console.error('An error occurred:', error);
		return [];
	}
};

export const getProductsByName = async (name: string) => {
	try {
		const response = await axiosClient.get(`/products?name=${name}`);

		return response.data.data.products;
	} catch (error) {
		console.error('Error fetching products:', error);
		throw new Error('Failed to fetch products');
	}
};
