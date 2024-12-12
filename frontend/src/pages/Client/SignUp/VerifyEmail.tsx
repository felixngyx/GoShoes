import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import Footer from '../../../components/client/Footer';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // Import các icon mắt
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { login, setUser } from '../../../store/client/userSlice';

const BASE_URL = import.meta.env.VITE_API_URL;

const VerifyEmail: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const type = searchParams.get('type');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [status, setStatus] = useState(false);
	const [newPhone, setNewPhone] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const access_token = Cookies.get('access_token');
	const user = useSelector((state: RootState) => state.client.user);
	const user_data = JSON.parse(Cookies.get('user') || '{}');
	const dispatch = useDispatch();

	// State for showing password
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleVerifyResetToken = async (token: string) => {
		try {
			await axiosClient.post('/auth/verify-reset-token', { token });
		} catch (error) {
			console.error('Invalid token');
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async () => {
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match!');
			return;
		}
		try {
			await axiosClient.post('/profile/reset-password', {
				token,
				password: newPassword,
				password_confirmation: confirmPassword,
			});
			toast.success('Password has been updated successfully!');
			navigate('/');
		} catch (error) {
			toast.error('Failed to update password. Please try again.');
			console.error('Failed to update password');
		}
	};

	const requestSendEmail = async () => {
		const message = toast.loading('Sending email...');
		try {
			const res = await axiosClient.post('/auth/send-verify-email');
			console.log(res);
			if (res.status === 200) {
				toast.success('Email sent successfully.');
				toast.dismiss(message);
			} else {
				toast.error('Failed to send email. Please try again.');
				toast.dismiss(message);
			}
		} catch (error) {
			console.error('Failed to resend email');
			toast.dismiss(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangePhone = async () => {
		try {
			await axiosClient.post('/profile/verify-token-change-phone', {
				token,
				phone: newPhone,
			});
			toast.success('Phone number has been updated successfully!');
			navigate('/account');
		} catch (error) {
			toast.error('Failed to update phone number. Please try again.');
			console.error('Failed to update phone number');
		}
	};

	const handleChangeEmail = async () => {
		try {
			await axiosClient.post('/profile/verify-token-change-email', {
				token,
				email: newEmail,
			});
			toast.success('Email has been updated successfully!');
			navigate('/account');
		} catch (error) {
			toast.error('Failed to update email. Please try again.');
			console.error('Failed to update email ');
		}
	};

	const handleVerifyEmail = async () => {
		try {
			const res = await axios.post(`${BASE_URL}/auth/register-verify`, {
				token,
			});
			if (res.status === 200) {
				setStatus(true);
				user_data.email_is_verified = true;
				Cookies.set('user', JSON.stringify(user_data));
				dispatch(setUser(user_data));
			}
		} catch (error: any) {
			if (error?.response?.status === 400) setStatus(false);
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Nếu không có token thì yêu cầu đăng nhập lại
		if (!token) {
			navigate('/signin');
			return; // Ngừng thực hiện nếu không có token
		}

		// Nếu là reset-password thì tiến hành xác minh token
		if (type === 'reset-password') {
			handleVerifyResetToken(token);
		}
		// Kiểm tra các loại khác như đăng ký hoặc thay đổi số điện thoại
		else if (type === 'register' && token) {
			handleVerifyEmail();
		} else if (type === 'change-phone' && token) {
			handleVerifyResetToken(token);
		}
	}, [token, type, navigate]);


	return (
		<>
			<div className="p-8 max-w-xl mx-auto mt-8 bg-white rounded-lg shadow-lg mb-8">
				{type === 'reset-password' ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleResetPassword();
						}}
						className="space-y-6"
					>
						<h1 className="text-2xl font-semibold text-center">
							Change Password
						</h1>
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">
									New Password
								</span>
							</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter new password"
									className="input input-bordered w-full p-4 rounded-md"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<span
									className="absolute right-3 top-3 cursor-pointer"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<AiOutlineEyeInvisible size={20} />
									) : (
										<AiOutlineEye size={20} />
									)}
								</span>
							</div>
						</div>
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">
									Confirm Password
								</span>
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Confirm new password"
									className="input input-bordered w-full p-4 rounded-md"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
								<span
									className="absolute right-3 top-3 cursor-pointer"
									onClick={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
								>
									{showConfirmPassword ? (
										<AiOutlineEyeInvisible size={20} />
									) : (
										<AiOutlineEye size={20} />
									)}
								</span>
							</div>
						</div>
						{error && <div className="text-red-500 text-sm">{error}</div>}
						<button
							type="submit"
							className="btn w-full bg-[#40BFFF] text-white hover:bg-[#32a5d6] mt-6 p-4 rounded-md"
						>
							Update Password
						</button>
					</form>
				) : type === 'change-phone' ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleChangePhone();
						}}
						className="space-y-6"
					>
						<h1 className="text-2xl font-semibold text-center">
							Change Phone Number
						</h1>
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">
									New Phone Number
								</span>
							</label>
							<input
								type="tel"
								placeholder="Enter new phone number"
								className="input input-bordered w-full p-4 rounded-md"
								value={newPhone}
								onChange={(e) => setNewPhone(e.target.value)}
								required
							/>
						</div>
						<button
							type="submit"
							className="btn w-full bg-[#40BFFF] text-white hover:bg-[#32a5d6] mt-6 p-4 rounded-md"
						>
							Update Phone Number
						</button>
					</form>
				) : type === 'change-email' ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleChangeEmail();
						}}
						className="space-y-6"
					>
						<h1 className="text-2xl font-semibold text-center">
							Change Email
						</h1>
						<div className="form-control">
							<label className="label">
								<span className="label-text font-medium">
									New Email Address
								</span>
							</label>
							<input
								type="email"
								placeholder="Enter new email"
								className="input input-bordered w-full p-4 rounded-md"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								required
							/>
						</div>
						<button
							type="submit"
							className="btn w-full bg-[#40BFFF] text-white hover:bg-[#32a5d6] mt-6 p-4 rounded-md"
						>
							Update Email Address
						</button>
					</form>
				) : (
					<div className="text-center">
						<h1 className="text-4xl mb-5">Verify Email</h1>
						{status ? (
							<p className="info-verify-email text-xl font-extralight text-green-500">
								Your email has been verified successfully.
							</p>
						) : (
							<p className="info-verify-email text-xl font-extralight text-red-500">
								Your session has expired, please resend email.
							</p>
						)}
						{status ? (
							<Link
								to="/"
								className="btn btn-outline bg-[#40BFFF] text-white mt-10"
							>
								Back to home page
							</Link>
						) : (
							<button
								className="btn btn-outline bg-[#40BFFF] text-white mt-10"
								onClick={requestSendEmail}
							>
								Resend email
							</button>
						)}
					</div>
				)}
			</div>
			<Footer />
		</>
	);
};

export default VerifyEmail;
