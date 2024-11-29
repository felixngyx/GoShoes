import { useMutation } from '@tanstack/react-query';
import {
  sendResetPasswordRequest,
  verifyTokenForResetPassword,
  resetPassword,
} from '../../services/client/profile';

// Helper function to validate email format
const isValidEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const usePass = () => {
  // Gửi yêu cầu reset mật khẩu
  const { mutate: sendResetPasswordMutation, isLoading: isSendingResetPassword } = useMutation({
    mutationFn: sendResetPasswordRequest,
    onSuccess: () => {
      console.log('Password reset request has been sent. Please check your email.');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to send password reset request';
      console.error('Error while sending reset password request:', errorMessage);
    },
  });

  // Xác minh token reset mật khẩu
  const { mutate: verifyResetTokenMutation, isLoading: isVerifyingResetToken } = useMutation({
    mutationFn: verifyTokenForResetPassword,
    onSuccess: (data) => {
      if (data) {
        console.log('Verification token successful:', data);
      }
    },
    onError: (error: any) => {
      if (error?.message === 'Network Error') {
        console.error('Network error occurred:', error);
        if (!window.isNetworkErrorShown) {
          console.error('Network error, please check your connection');
          window.isNetworkErrorShown = true; // Đánh dấu lỗi đã được hiển thị
        }
      } else {
        const errorMessage = error?.response?.data?.message || 'Verification failed';
      }
    },
  });

  // Đặt lại mật khẩu mới
  const { mutate: resetPasswordMutation, isLoading: isResettingPassword } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      console.log('Password reset successful');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to reset password';
      console.error('Error while resetting password:', errorMessage);
    },
  });

  // Hàm xử lý gửi yêu cầu reset mật khẩu
  const handleSendResetPasswordRequest = (email: string) => {
    if (!email) {
      console.error('Email cannot be empty');
      return;
    }
    if (!isValidEmail(email)) {
      console.error('Invalid email format');
      return;
    }
    console.log('Sending reset password request for email:', email);
    sendResetPasswordMutation({ email });
  };

  // Hàm xử lý xác minh token reset mật khẩu
  const handleVerifyResetToken = (token: string) => {
    if (!token) {
      console.error('Token cannot be empty');
      return;
    }
    verifyResetTokenMutation({ token, type: 'reset-password' });
  };

  // Hàm xử lý đặt lại mật khẩu mới
  const handleResetPassword = (token: string, password: string, password_confirmation: string) => {
    if (!password || password !== password_confirmation) {
      console.error('Password and confirmation password do not match');
      return;
    }
    console.log('Resetting password with token:', token);
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
