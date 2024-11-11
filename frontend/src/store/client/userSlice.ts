import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
export interface UserState {
	name: string | null;
	email: string | null;
	email_is_verified: boolean;
	is_admin: boolean;
	access_token: string | null;
}

const access_token = Cookies.get('access_token');

const initialState: UserState = {
	name: null,
	email: null,
	email_is_verified: false,
	is_admin: false,
	access_token: access_token || null,
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
			state.access_token = action.payload.access_token;
		},
		logout(state) {
			state.name = null;
			state.email = null;
			state.email_is_verified = false;
			state.is_admin = false;
			state.access_token = null;
		},
	},
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
