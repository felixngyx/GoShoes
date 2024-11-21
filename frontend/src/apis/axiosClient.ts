/// <reference types="vite/client" />

import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers':
			'Origin, Content-Type, Accept, Authorization',
	},
});

axiosClient.interceptors.request.use(
	async (config) => {
		const token = Cookies.get('access_token');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const pathname = window.location.pathname;
		if (pathname.includes('/signin')) {
			return Promise.reject(error);
		}

		const originalRequest = error.config;

		if (error.response.status === 422) {
			originalRequest._retry = true;

			const refreshToken = Cookies.get('refresh_token');

			if (!refreshToken) {
				Cookies.remove('access_token');
				Cookies.remove('refresh_token');
				Cookies.remove('user');
				toast.error('Your session has expired');
				if (pathname.includes('admin')) {
					window.location.href = '/admin/signin';
				} else {
					window.location.href = '/signin';
				}
				return Promise.reject(error);
			}

			try {
				const response = await axiosClient.post('/auth/refresh-token', {
					refresh_token: refreshToken,
				});
				Cookies.set('access_token', response.data.access_token);
				return axiosClient(originalRequest);
			} catch (error) {
				Cookies.remove('access_token');
				Cookies.remove('refresh_token');
				Cookies.remove('user');
				toast.error('Your session has expired');
				if (!pathname.includes('admin')) {
					window.location.href = '/signin';
				} else {
					window.location.href = '/admin/signin';
				}
				return Promise.reject(error);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosClient;
