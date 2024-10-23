import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
	username: string | null;
	email: string | null;
	email_is_verified: boolean;
	is_admin: boolean;
}

const initialState: UserState = {
	username: null,
	email: null,
	email_is_verified: false,
	is_admin: false,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		login(state, action: PayloadAction<any>) {
			state.username = action.payload.user;
			state.email = action.payload.email;
			state.email_is_verified = action.payload.email_is_verified;
			state.is_admin = action.payload.is_admin;
		},
		logout(state) {
			state.username = null;
			state.email = null;
			state.email_is_verified = false;
			state.is_admin = false;
		},
	},
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
