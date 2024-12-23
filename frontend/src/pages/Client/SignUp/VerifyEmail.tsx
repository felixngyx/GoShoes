import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import Footer from '../../../components/client/Footer';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setUser } from '../../../store/client/userSlice';
import usePass from '../../../hooks/client/usePass';
import useProfile from '../../../hooks/client/useProfile';
import LoadingIcon from '../../../components/common/LoadingIcon';

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
	const { handleResetPassword } = usePass();
	const { handleVerifyTokenChangeEmail, handleVerifyTokenChangePhone } = useProfile();


	// State for showing password
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleVerifyResetToken = async (token: string) => {
		try {
			await axios.post('/auth/verify-reset-token', { token });
		} catch (error) {
			console.error('Invalid token');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmitResetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error('Mật khẩu không khớp!');
			return;
		}
		handleResetPassword(token, newPassword, confirmPassword);
	};

	const requestSendEmail = async () => {
		const message = toast.loading('Đang gửi email...');
		try {
			const res = await axiosClient.post('/auth/send-verify-email');
			console.log(res);
			if (res.status === 200) {
				toast.success('Gửi email thành công.');
				toast.dismiss(message);
			} else {
				toast.error('Gửi email thất bại. Vui lòng thử lại.');
				toast.dismiss(message);
			}
		} catch (error) {
			console.error('Failed to resend email');
			toast.dismiss(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChangeEmail = (e: React.FormEvent) => {
		e.preventDefault();
		if (!token || !newEmail) {
			toast.error('Token và email không hợp lệ');
			return;
		}
		handleVerifyTokenChangeEmail(token, newEmail);
	};

	const handleChangePhone = (e: React.FormEvent) => {
		e.preventDefault();
		if (!token || !newPhone) {
			toast.error('Token và số điện thoại không hợp lê');
			return;
		}
		handleVerifyTokenChangePhone(token, newPhone);
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
		// if ((!user || !access_token) && type !== 'reset-password') {
		// 	navigate('/signin');
		// 	return;
		// }

		// Kiểm tra các loại khác như đăng ký hoặc thay đổi số điện thoại
		if (type === 'register' && token) {
			handleVerifyEmail();
		} else if (type === 'change-phone' && token) {
			handleVerifyResetToken(token);
		}
		// Xử lý reset-password mà không cần điều kiện đăng nhập
		else if (type === 'reset-password' && token) {
			setIsLoading(false); // Đặt trạng thái loading là false, không cần làm gì thêm
		}
	}, [token, type, navigate, user, access_token])


	return (
		<>
			{isLoading ? (
				<div className="flex items-center justify-center h-screen">
					<LoadingIcon type='spinner' color='info' size='lg' />
				</div>
			) : (
				<div className="p-8 max-w-xl mx-auto mt-8 bg-white rounded-lg shadow-lg mb-8">
					{type === 'reset-password' && (
						<form onSubmit={handleSubmitResetPassword} className="space-y-6">
							<h1 className="text-2xl font-semibold text-center">Đổi mật khẩu</h1>
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium">Mật khẩu mới</span>
								</label>
								<div className="relative">
									<input
										type={showPassword ? 'text' : 'password'}
										placeholder="Nhập mật khẩu mới"
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
									<span className="label-text font-medium">Xác nhận mật khẩu</span>
								</label>
								<div className="relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder="Xác nhận mật khẩu mới"
										className="input input-bordered w-full p-4 rounded-md"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
									<span
										className="absolute right-3 top-3 cursor-pointer"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
								Cập nhật mật khẩu
							</button>
						</form>
					)}

					{type === 'change-phone' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleChangePhone(e);
							}}
							className="space-y-6"
						>
							<h1 className="text-2xl font-semibold text-center">Đổi số điện thoại</h1>
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium">Số điện thoại mới</span>
								</label>
								<input
									type="tel"
									placeholder="Nhập số điện thoại mới"
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
								Cập nhật số điện thoại
							</button>
						</form>
					) : type === 'change-email' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleChangeEmail(e);
							}}
							className="space-y-6"
						>
							<h1 className="text-2xl font-semibold text-center">Thay đổi email</h1>
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium">Email thay đổi</span>
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
								Cập Nhật Email
							</button>
						</form>
					) : type !== 'reset-password' && type !== 'change-phone' && type !== 'change-email' ? (
						<div className="text-center">
							<h1 className="text-4xl mb-5">Xác minh email</h1>
							{status ? (
								<p className="info-verify-email text-xl font-extralight text-green-500">
									Email của bạn đã được xác minh thành công.
								</p>
							) : (
								<p className="info-verify-email text-xl font-extralight text-red-500">
									Phiên của bạn đã hết hạn, vui lòng gửi lại email.
								</p>
							)}
							{status ? (
								<Link
									to="/"
									className="btn btn-outline bg-[#40BFFF] text-white mt-10"
								>
									Quay lại trang chủ
								</Link>
							) : (
								<button
									className="btn btn-outline bg-[#40BFFF] text-white mt-10"
									onClick={requestSendEmail}
								>
									Gửi lại email
								</button>
							)}
						</div>
					) : null}
				</div>)}
			<Footer />
		</>
	);
};

export default VerifyEmail;
