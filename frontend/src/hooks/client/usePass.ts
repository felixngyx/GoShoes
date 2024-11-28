import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  sendResetPasswordRequest,
  verifyTokenForResetPassword,
  resetPassword,
} from '../../services/client/profile';

const usePass = () => {
  // Gửi yêu cầu reset mật khẩu
  const { mutate: sendResetPasswordMutation, isLoading: isSendingResetPassword } = useMutation({
    mutationFn: sendResetPasswordRequest,
    onSuccess: () => {
      toast.success('Password reset request has been sent. Please check your email.');
    },
    onError: (error: any) => {
      console.error('Error while sending reset password request:', error);
      toast.error('Failed to send password reset request');
    },
  });

  // Xác minh token reset mật khẩu
  const { mutate: verifyResetTokenMutation, isLoading: isVerifyingResetToken } = useMutation({
    mutationFn: verifyTokenForResetPassword,
    onSuccess: (data) => {
      if (data) {
        // Lưu token vào cookie hoặc xử lý logic thành công tại đây
        toast.success('Verification token successful');
      }
    },
    onError: (error: any) => {
      console.error('Error while verifying reset password token:', error);
      toast.error('Failed to verify reset password token');
    },
  });

  // Đặt lại mật khẩu mới
  const { mutate: resetPasswordMutation, isLoading: isResettingPassword } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful');
    },
    onError: (error: any) => {
      console.error('Error while resetting password:', error);
      toast.error('Failed to reset password');
    },
  });

  // Hàm xử lý gửi yêu cầu reset mật khẩu
  const handleSendResetPasswordRequest = (email: string) => {
    if (!email) {
      toast.error('Email cannot be empty');
      return;
    }
    sendResetPasswordMutation({ email });
  };

  // Hàm xử lý xác minh token reset mật khẩu
  const handleVerifyResetToken = (token: string) => {
    if (!token) {
      toast.error('Token cannot be empty');
      return;
    }
    verifyResetTokenMutation({ token, type: 'reset-password' });
  };

  // Hàm xử lý đặt lại mật khẩu mới
  const handleResetPassword = (token: string, password: string, password_confirmation: string) => {
    if (!password || password !== password_confirmation) {
      toast.error('Password and confirmation password do not match');
      return;
    }
    resetPasswordMutation({ token, password, password_confirmation });
  };

  return {
    isSendingResetPassword,
    isVerifyingResetToken,
    isResettingPassword,
    handleSendResetPasswordRequest,
    handleVerifyResetToken,
    handleResetPassword,
  };
};

export default usePass;
