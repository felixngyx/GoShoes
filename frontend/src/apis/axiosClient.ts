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

axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			const refreshToken = Cookies.get('refresh_token');

			if (!refreshToken) {
				Cookies.remove('access_token');
				Cookies.remove('refresh_token');
				window.location.href = '/sign-in';
				return Promise.reject(error);
			}

			try {
				const response = await axiosClient.post('/auth/refresh-token', {
					refresh_token: refreshToken,
				});
				Cookies.set('access_token', response.data.access_token);
				return axiosClient(originalRequest);
			} catch (error) {
				return Promise.reject(error);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosClient;
