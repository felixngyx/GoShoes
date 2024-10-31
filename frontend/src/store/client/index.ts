import { combineReducers } from 'redux';
import userReducer from './userSlice';

const clientReducer = combineReducers({
	user: userReducer,
});

export default clientReducer;
