/// <reference types="vite/client" />

import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
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

export default axiosClient;
