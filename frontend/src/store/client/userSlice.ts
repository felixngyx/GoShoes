import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
export interface UserState {
	name: string | null;
	email: string | null;
	email_is_verified: boolean;
	is_admin: boolean;
}

const user = Cookies.get('user');

const initialState: UserState = {
	name: user ? JSON.parse(user).name : null,
	email: user ? JSON.parse(user).email : null,
	email_is_verified: user ? JSON.parse(user).email_is_verified : false,
	is_admin: user ? JSON.parse(user).is_admin : false,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		login(state, action: PayloadAction<any>) {
			state.name = action.payload.name;
			state.email = action.payload.email;
			state.email_is_verified = action.payload.email_is_verified;
			state.is_admin = action.payload.is_admin;
		},
		logout(state) {
			state.name = null;
			state.email = null;
			state.email_is_verified = false;
			state.is_admin = false;
			Cookies.remove('user');
			Cookies.remove('access_token');
			Cookies.remove('refresh_token');
		},
	},
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
