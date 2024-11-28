import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
	baseURL,
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
		const pathname = window.location.pathname;

		// Bỏ qua kiểm tra cho các trang public
		const publicPaths = ['/', '/signin', '/signup', '/products', '/product'];

		const originalRequest = error.config;

		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = Cookies.get('refresh_token');

			if (!refreshToken) {
				Cookies.remove('access_token');
				Cookies.remove('refresh_token');
				Cookies.remove('user');
				toast.error('Your session has expired');

				// Chỉ chuyển hướng cho các trang admin và trang yêu cầu xác thực
				if (pathname.includes('/admin')) {
					window.location.href = '/admin/signin';
				} else if (!publicPaths.some((path) => pathname.startsWith(path))) {
					window.location.href = '/signin';
				}
				return Promise.reject(error);
			}

			try {
				const response = await fetch(`${baseURL}/auth/refresh-token`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${refreshToken}`,
					},
				});
				// console.log('refresh token', refreshToken);
				// console.log(response);
				const data = await response.json();
				Cookies.set('access_token', data.access_token);
				return axiosClient(originalRequest);
			} catch (error) {
				Cookies.remove('access_token');
				Cookies.remove('refresh_token');
				Cookies.remove('user');
				toast.error('Your session has expired');

				// Chỉ chuyển hướng cho các trang admin và trang yêu cầu xác thực
				if (pathname.includes('/admin')) {
					window.location.href = '/admin/signin';
				} else if (!publicPaths.some((path) => pathname.startsWith(path))) {
					window.location.href = '/signin';
				}
				return Promise.reject(error);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosClient;
