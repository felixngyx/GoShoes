import React, { useState, useEffect } from 'react';
import useProfile from '../../../../hooks/client/useProfile';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
  email: string; // Email được truyền từ ProfileForm
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Destructure các hàm từ hook
  const {
    handleSendResetPasswordRequest,
    isSendingResetPassword,
    isResettingPassword,
  } = useProfile();

  // Hàm xử lý gửi yêu cầu reset mật khẩu
  const handleSendResetRequest = () => {
    if (!email) {
      toast.error('Email không hợp lệ!');
      return;
    }
    handleSendResetPasswordRequest(email); // Gửi yêu cầu reset mật khẩu tới email
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Gửi yêu cầu reset mật khẩu
    handleSendResetRequest();

    toast.success('Yêu cầu thay đổi mật khẩu đã được gửi!');
  };

  useEffect(() => {
    if (!email) {
      toast.error('Không tìm thấy email!');
    }
  }, [email]);

  return (
    <div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-2">
      <form className="grid grid-cols-2 gap-x-5 gap-y-2" onSubmit={handleSubmit}>
        {/* Mật khẩu mới */}
        <label className="form-control col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">New Password</span>
          </div>
          <input
            type="password"
            placeholder="Enter your new password"
            className="input input-bordered w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        {/* Xác nhận mật khẩu mới */}
        <label className="form-control col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Confirm Password</span>
          </div>
          <input
            type="password"
            placeholder="Confirm your new password"
            className="input input-bordered w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {/* Nút cập nhật */}
        <button
          type="submit"
          className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] col-span-2 mt-5"
          disabled={isSendingResetPassword || isResettingPassword}
        >
          {isSendingResetPassword || isResettingPassword ? 'Processing...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
