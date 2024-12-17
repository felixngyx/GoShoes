import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
	getProfile,
	updateProfile,
	sendEmailChangeRequest,
	verifyTokenChangeEmail,
	sendPhoneChangeRequest,
	verifyTokenChangePhone,
} from '../../services/client/profile';
import { ProfileParams, Profile } from '../../types/client/profile';
import { useNavigate } from 'react-router-dom';

const useProfile = () => {
	const navigate = useNavigate();

	// Lấy dữ liệu Profile
	const { data: profile, isLoading } = useQuery<Profile | null>({
		queryKey: ['PROFILE'],
		queryFn: getProfile,
		onError: (error: any) => {
			console.error('Error while fetching profile:', error);
			toast.error('Không thể lấy thông tin hồ sơ');
		},
	});

	// Cập nhật Profile
	const { mutate: updateProfileMutation, isLoading: isUpdating } = useMutation(
		{
			mutationFn: updateProfile,
			onSuccess: () => {
				toast.success('Cập nhật hồ sơ thành công');
			},
			onError: (error: any) => {
				console.error('Error while updating profile:', error);
				toast.error('Cập nhật hồ sơ thất bại');
			},
		}
	);

	// Gửi yêu cầu thay đổi email
	const { mutate: sendEmailChangeMutation, isLoading: isSendingEmail } =
		useMutation({
			mutationFn: sendEmailChangeRequest,
			onSuccess: () => {
				toast.success(
					'Yêu cầu thay đổi email đã được gửi. Vui lòng kiểm tra email của bạn.'
				);
			},
			onError: (error: any) => {
				console.error('Error while sending email change request:', error);
				toast.error('Gửi yêu cầu thay đổi email thất bại');
			},
		});

	// Xác minh token đổi email
	const { mutate: verifyTokenMutation, isLoading: isVerifyingToken } =
		useMutation({
			mutationFn: verifyTokenChangeEmail,
			onSuccess: () => {
				toast.success('Email đã được thay đổi thành công');
				navigate('/account');
			},
		});

	// Gửi yêu cầu thay đổi số điện thoại
	const { mutate: sendPhoneChangeMutation, isLoading: isSendingPhone } =
		useMutation({
			mutationFn: sendPhoneChangeRequest,
			onSuccess: () => {
				toast.success(
					'Yêu cầu thay đổi số điện thoại đã được gửi. Vui lòng kiểm tra điện thoại của bạn.'
				);
			},
			onError: (error: any) => {
				console.error('Error while sending phone change request:', error);
			},
		});

	// Xác minh token thay đổi số điện thoại
	const {
		mutate: verifyPhoneTokenMutation,
		isLoading: isVerifyingPhoneToken,
	} = useMutation({
		mutationFn: verifyTokenChangePhone,
		onSuccess: () => {
			toast.success('Số điện thoại đã được thay đổi thành công');
			navigate('/account');
		},
	});

	// Xử lý gửi yêu cầu thay đổi email
	const handleSendEmailChangeRequest = () => {
		sendEmailChangeMutation(); // Gọi mutation mà không cần tham số
	};

	// Xử lý xác minh token thay đổi email
	const handleVerifyTokenChangeEmail = (token: string, email: string) => {
		if (!token || !email) {
			toast.error('Token và email không được để trống');
			return;
		}
		verifyTokenMutation({ token, email });
	};

	// Xử lý gửi yêu cầu thay đổi số điện thoại
	const handleSendPhoneChangeRequest = () => {
		sendPhoneChangeMutation(); // Gọi mutation mà không cần tham số
	};

	// Xử lý xác minh token thay đổi số điện thoại
	const handleVerifyTokenChangePhone = (token: string, phone: string) => {
		if (!token || !phone) {
			toast.error('Token và số điện thoại không được để trống');
			return;
		}
		verifyPhoneTokenMutation({ token, phone });
	};
	const handleUpdateProfile = (params: ProfileParams) => {
		updateProfileMutation({
			...params,
		});
	};

	// Xử lý thay đổi avatar
	const handleUpdateAvatar = async (base64Image: string) => {
		const updatedProfile = {
			avt: base64Image,
			name: profile?.name || '',
			email: profile?.email || '',
			birth_date: profile?.birth_date || '',
			gender: profile?.gender || '',
			phone: profile?.phone ? profile.phone.toString() : '',
			bio: profile?.bio || '',
		};

		try {
			await updateProfileMutation(updatedProfile);
		} catch (error) {
			throw new Error('Cập nhật hồ sơ thất bại');
		}
	};

	// Hàm chuyển file ảnh thành base64
	const convertToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	};

	return {
		profile,
		isLoading,
		isUpdating,
		handleUpdateProfile,
		handleUpdateAvatar,
		handleSendEmailChangeRequest,
		handleVerifyTokenChangeEmail,
		handleSendPhoneChangeRequest,
		handleVerifyTokenChangePhone,
	};
};

export default useProfile;
