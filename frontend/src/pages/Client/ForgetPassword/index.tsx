import React, { useState } from 'react';
import usePass from '../../../hooks/client/usePass';
import toast from 'react-hot-toast';

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const { handleSendResetPasswordRequest, isSendingResetPassword } = usePass();

  // Hàm gửi yêu cầu reset mật khẩu
  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email là bắt buộc');
      return;
    }

    try {
      await handleSendResetPasswordRequest(email);
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu reset mật khẩu:', error);
      toast.error('Gửi yêu cầu reset mật khẩu thất bại');
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-stroke">
        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>
        <form className="flex flex-col gap-5" onSubmit={handleResetPasswordRequest}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`w-full bg-[#40BFFF] text-white p-2 rounded-md hover:bg-[#259CFA] transition-colors ${isSendingResetPassword ? 'cursor-not-allowed bg-[#259CFA]' : ''}`}
            disabled={isSendingResetPassword}
          >
            {isSendingResetPassword ? 'Đang gửi yêu cầu...' : 'Quên mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
