import axios from 'axios';
import { env } from '../environment/env';

const uploadImageToCloudinary = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);
	formData.append('cloud_name', env.VITE_CLOUDINARY_CLOUD_NAME);
	formData.append('api_key', env.VITE_CLOUDINARY_API_KEY);

	const response = await axios.post(
		`https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
		formData
	);

	return response.data.url;
};

export default uploadImageToCloudinary;
