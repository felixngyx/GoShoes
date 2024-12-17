import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
export interface UserState {
	name: string | null;
	email: string | null;
	email_is_verified: boolean;
	role: 'super-admin' | 'admin' | 'user';
	avt: string | undefined;
	auth_provider?: string | null;
}

const user = Cookies.get('user');

const userInformation = user ? JSON.parse(user) : null;

const initialState: UserState = {
	name: userInformation ? userInformation.name : null,
	email: userInformation ? userInformation.email : null,
	email_is_verified: userInformation
		? userInformation.email_is_verified
		: false,
	role: userInformation ? userInformation.role : 'user',
	avt: userInformation ? userInformation.avt : undefined,
	auth_provider: userInformation ? userInformation.auth_provider : null,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<any>) {
			state.name = action.payload.name;
			state.email = action.payload.email;
			state.email_is_verified = action.payload.email_is_verified;
			state.role = action.payload.role;
			state.avt = action.payload.avt;
			state.auth_provider = action.payload.auth_provider;
		},
		login(state, action: PayloadAction<any>) {
			state.name = action.payload.name;
			state.email = action.payload.email;
			state.email_is_verified = action.payload.email_is_verified;
			state.role = action.payload.role;
			state.avt = action.payload.avt || undefined;
			state.auth_provider = action.payload.auth_provider;
		},
		logout(state) {
			state.name = null;
			state.email = null;
			state.email_is_verified = false;
			state.role = 'user';
			state.avt = undefined;
			state.auth_provider = null;
			Cookies.remove('user');
			Cookies.remove('access_token');
			Cookies.remove('refresh_token');
		},
	},
});

export const { login, logout, setUser } = userSlice.actions;
export default userSlice.reducer;
