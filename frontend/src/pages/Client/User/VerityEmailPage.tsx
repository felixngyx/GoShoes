import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePass from '../../../hooks/client/usePass';
import Footer from '../../../components/client/Footer';
import Navbar from '../../../components/client/Navbar';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { handleVerifyResetToken, handleResetPassword } = usePass();

  useEffect(() => {
    if (token && type === 'reset-password') {
      handleVerifyResetToken(token, type);
    } else {
      console.log('Invalid or missing token/type.');
    }
  }, [token, type]);

  // Reset mật khẩu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!token) {
      console.error('Token is required');
      return;
    }

    try {
      await handleResetPassword(token, newPassword, confirmPassword);
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Failed to update password');
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-xl mx-auto mt-8 bg-white rounded-lg shadow-lg mb-8">
        {type === 'reset-password' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thêm thẻ h1 */}
            <h1 className="text-2xl font-semibold text-center">Change Password</h1>
  
            {/* Input New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="input input-bordered w-full p-4 rounded-md border-gray-300 focus:border-[#40BFFF] focus:ring-[#40BFFF] transition duration-200"
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
                placeholder="Confirm new password"
                className="input input-bordered w-full p-4 rounded-md border-gray-300 focus:border-[#40BFFF] focus:ring-[#40BFFF] transition duration-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
  
            {/* Display Error */}
            {error && <div className="text-red-500 text-sm">{error}</div>}
  
            {/* Submit Button */}
            <button
              type="submit"
              className="btn w-full bg-[#40BFFF] text-white hover:bg-[#32a5d6] mt-6 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#40BFFF] transition duration-200"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
  
};

export default VerifyEmailPage;
