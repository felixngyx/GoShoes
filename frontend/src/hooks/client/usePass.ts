import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  sendResetPasswordRequest,
  verifyTokenForResetPassword,
  resetPassword,
} from '../../services/client/profile';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { logout } from '../../store/client/userSlice';

const usePass = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState<string | null>(null);

  const logoutHandler = () => {
    dispatch(logout());
    setAvatar(null);
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    navigate('/signin');
  };

  // Gửi yêu cầu reset mật khẩu
  const { mutate: sendResetPasswordMutation, isLoading: isSendingResetPassword } = useMutation({
    mutationFn: sendResetPasswordRequest,
    onSuccess: () => {
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi thành công');
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại';
      toast.error(`Lỗi: ${errorMessage}`);
    },
  });

  // Xác minh token reset mật khẩu
  const { mutate: verifyResetTokenMutation, isLoading: isVerifyingResetToken } = useMutation({
    mutationFn: verifyTokenForResetPassword,
    onSuccess: (data) => {
      if (data) {
        console.log('Xác minh token thành công:', data);
      }
    },
    onError: (error) => {
      console.error('Lỗi khi xác minh token:', error);
    },
  });

  // Đặt lại mật khẩu mới
  const { mutate: resetPasswordMutation, isLoading: isResettingPassword } = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công');
      logoutHandler();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      toast.error(`Lỗi: ${errorMessage}`);
    },
  });

  // Hàm xử lý gửi yêu cầu reset mật khẩu
  const handleSendResetPasswordRequest = (email) => {
    if (!email) {
      toast.error('Email không được để trống');
      return;
    }
    sendResetPasswordMutation({ email });
  };

  // Hàm xử lý xác minh token reset mật khẩu
  const handleVerifyResetToken = (token) => {
    if (!token) {
      toast.error('Token không được để trống');
      return;
    }
    verifyResetTokenMutation({ token, type: 'reset-password' });
  };

  // Hàm xử lý đặt lại mật khẩu mới
  const handleResetPassword = (token, password, password_confirmation) => {
    if (!password || password !== password_confirmation) {
      toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }
    console.log('Đang đặt lại mật khẩu với token:', token);
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
