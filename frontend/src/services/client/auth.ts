import axiosClient from '../../apis/axiosClient';
const authService = {
	login: (credentials: { email: string; password: string }) => {
		return axiosClient.post('/auth/login', credentials);
	},

	register: (credentials: {
		email: string;
		password: string;
		name: string;
	}) => {
		return axiosClient.post('/auth/register', credentials);
	},
};

export default authService;