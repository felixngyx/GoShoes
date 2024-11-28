import React, { useState, useEffect } from 'react';
import usePass from '../../../../hooks/client/usePass';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
  email: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null); // Lưu token xác minh
  
  const {
    handleResetPassword,
    handleVerifyResetToken,
    handleSendResetPasswordRequest, // Hàm gửi yêu cầu reset mật khẩu
    isResettingPassword,
    isVerifyingResetToken,
    isSendingResetPassword,
  } = usePass();

  // Hàm gửi yêu cầu reset mật khẩu
  const handleSendResetPasswordRequestAction = async () => {
    if (!email) {
      toast.error('Email not found!');
      return;
    }

    try {
      await handleSendResetPasswordRequest(email);
      toast.success('Password reset request sent to your email!');
    } catch (error) {
      console.error('Error during password reset request:', error);
      toast.error('Failed to send reset password request');
    }
  };

  // Hàm xác minh token
  const handleVerifyToken = async () => {
    if (!token) {
      toast.error('Token is required');
      return;
    }

    try {
      // Gửi yêu cầu xác minh token với trường type là "reset-password"
      await handleVerifyResetToken({ token, type: 'reset-password' });
      toast.success('Token verified successfully!');
    } catch (error) {
      console.error('Error during token verification:', error);
      toast.error('Failed to verify token');
    }
  };

  // Hàm reset mật khẩu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Xóa lỗi nếu hợp lệ
    setError('');

    if (!token) {
      toast.error('Token not verified');
      return;
    }

    try {
      // Gửi yêu cầu reset password
      await handleResetPassword(token, newPassword, confirmPassword);
      toast.success('Password updated successfully!');
      console.log('Payload being sent:', { token, password: newPassword, password_confirmation: confirmPassword });

      // Reset lại form sau khi thành công
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error during password update:', error);
      toast.error(error.response?.data?.message || 'Failed to update password!');
    }
  };

  useEffect(() => {
    if (!email) {
      toast.error('Email not found!');
    }
  }, [email]);

  return (
    <div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-2">
      <h1 className="text-2xl font-semibold mb-5">Change Password</h1>
      
      {/* Step 1: Gửi yêu cầu reset mật khẩu */}
      {!token && !isSendingResetPassword && (
        <div className="mb-4">
          <button
            onClick={handleSendResetPasswordRequestAction}
            className="btn btn-block text-white bg-[#40BFFF] hover:bg-[#259CFA]"
          >
            Send Password Reset Request
          </button>
        </div>
      )}

      {/* Step 2: Xác minh token */}
      {token && !isVerifyingResetToken && (
        <div className="mb-4">
          <button
            onClick={handleVerifyToken}
            className="btn btn-block text-white bg-[#40BFFF] hover:bg-[#259CFA]"
          >
            Verify Token
          </button>
        </div>
      )}

      {/* Step 3: Reset mật khẩu */}
      {token && (
        <form className="grid grid-cols-1 gap-y-5" onSubmit={handleSubmit}>
          {/* Input New Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              className={`input input-bordered w-full ${
                error && 'border-red-500 focus:border-red-500'
              }`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Input Confirm Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm your new password"
              className={`input input-bordered w-full ${
                error && 'border-red-500 focus:border-red-500'
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && <span className="text-red-500 text-sm">{error}</span>}

          {/* Button Submit */}
          <button
            type="submit"
            className={`btn btn-block text-white ${
              isResettingPassword ? 'bg-[#259CFA] cursor-not-allowed' : 'bg-[#40BFFF] hover:bg-[#259CFA]'
            } mt-5`}
            disabled={isResettingPassword || !token}
          >
            {isResettingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordForm;
