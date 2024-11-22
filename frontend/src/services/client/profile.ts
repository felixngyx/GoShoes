import axiosClient from '../../apis/axiosClient';

export interface ProfileParams {
	name: string;
	email: string;
	phone: string;
	address: string;
}

// Lấy thông tin profile người dùng
export const getProfile = async () => {
	try {
		const response = await axiosClient.get('/user');
		return response.data;
	} catch (error) {
		console.error('Lỗi khi lấy thông tin profile:', error);
		throw error;
	}
};

// Cập nhật thông tin profile người dùng
export const updateProfile = async (params: ProfileParams) => {
	try {
		const response = await axiosClient.put('/user', params);
		return response.data;
	} catch (error) {
		console.error('Lỗi khi cập nhật thông tin profile:', error);
		throw error;
	}
};
