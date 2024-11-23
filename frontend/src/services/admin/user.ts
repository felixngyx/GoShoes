import axiosClient from '../../apis/axiosClient';

export type User = {
	id: number;
	name: string;
	email: string;
	phone: string;
	password: string;
	is_deleted: 0 | 1;
	auth_provider: string;
	email_verified_at: string;
	remember_token: string;
	avt: string;
	facebook_id: string;
	created_at: string;
	updated_at: string;
	bio: string;
	birth_date: string;
	gender: 'male' | 'female' | 'other';
	role: 'super-admin' | 'admin' | 'user';
};

export type User_Update = {
	admin?: string;
	is_deleted?: 0 | 1;
};

const userService = {
	getAll: async (): Promise<User[]> => {
		const response = await axiosClient.get('/admin/user');
		return response.data.data;
	},

	update: (id: number, data: User_Update) => {
		return axiosClient.put(`/admin/user/${id}`, data);
	},

	delete: (id: number) => {
		return axiosClient.delete(`/admin/user/${id}`);
	},
};

export default userService;
