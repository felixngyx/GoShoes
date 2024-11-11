import axiosClient from '../../apis/axiosClient';

// Định nghĩa kiểu cho dữ liệu đầu vào của Facebook
interface FacebookLoginData {
	access_token: string; // Hoặc kiểu phù hợp với dữ liệu mà bạn nhận từ Facebook
}

const authService = {
	login: (credentials: { email: string; password: string }) => {
		return axiosClient.post('/auth/login', credentials);
	},
	loginWithFacebook(data: FacebookLoginData) {
		// Chỉ định kiểu cho tham số data
		return axiosClient.post(
			`${import.meta.env.VITE_API_URL}/auth/facebook-login`,
			data
		);
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
