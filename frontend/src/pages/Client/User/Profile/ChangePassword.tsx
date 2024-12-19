import React, { useEffect, useState } from 'react';
import usePass from '../../../../hooks/client/usePass';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
interface ChangePasswordFormProps {
	email: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email }) => {
	const { handleSendResetPasswordRequest, isSendingResetPassword } = usePass();

	const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

	useEffect(() => {
		const userInfo = Cookies.get('user');

		if (userInfo) {
			const userData = JSON.parse(userInfo);
			setIsVerifyingEmail(userData.email_is_verified);
		}
	}, []);

	// Hàm gửi yêu cầu đặt lại mật khẩu khi người dùng nhấn nút
	const handleSendResetPasswordRequestAction = async () => {
		if (!email) {
			toast.error('Không tìm thấy email!');
			return;
		}

		try {
			await handleSendResetPasswordRequest(email);
		} catch (error) {
			console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
			toast.error('Gửi yêu cầu đặt lại mật khẩu thất bại.');
		}
	};

	return (
		<div className="p-5 rounded-lg border border-gray-200 shadow-lg">
			<button
				onClick={handleSendResetPasswordRequestAction}
				disabled={isSendingResetPassword || !isVerifyingEmail}
				className={`btn btn-block text-white ${isSendingResetPassword || isVerifyingEmail
					? ' bg-[#40BFFF] cursor-not-allowed'
					: 'bg-[#40BFFF] hover:bg-[#259CFA]'
					}`}
			>
				{isSendingResetPassword
					? 'Đang gửi yêu cầu...'
					: 'Gửi yêu cầu đặt lại mật khẩu'}
			</button>
		</div>
	);
};

export default ChangePasswordForm;
