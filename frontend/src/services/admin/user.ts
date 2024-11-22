import axiosClient from '../../apis/axiosClient';

export type User = {
	id?: number;
	name?: string;
	email?: string;
	phone?: string;
	is_admin?: boolean;
	is_deleted?: boolean;
	auth_provider?: string;
	email_verified_at?: string;
	avt?: string;
	facebook_id?: string;
	created_at?: string;
	updated_at?: string;
};

export type User_Update = {
	name?: string;
	email?: string;
	phone?: string;
	is_deleted?: boolean;
	is_admin?: boolean;
	admin?: string;
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
