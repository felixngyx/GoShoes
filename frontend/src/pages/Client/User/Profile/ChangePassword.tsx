import React from 'react';
import usePass from '../../../../hooks/client/usePass';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

interface ChangePasswordFormProps {
	email: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email }) => {
	const { handleSendResetPasswordRequest, isSendingResetPassword } = usePass();
	const { user } = useSelector((state: RootState) => state.client);

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
				disabled={isSendingResetPassword || !user.email_is_verified}
				className={`btn btn-block text-white ${
					isSendingResetPassword || user.email_is_verified
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
