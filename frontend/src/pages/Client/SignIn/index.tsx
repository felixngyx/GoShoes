import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Navbar from '../../../components/client/Navbar';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { env } from '../../../environment/env';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import { IUser } from '../../../types/client/user';
import { joiResolver } from '@hookform/resolvers/joi';
import authService from '../../../services/client/auth';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../../store/client/userSlice';
import toast from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { RootState } from '../../../store';

const schema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			'string.email': 'Địa chỉ email không hợp lệ',
			'string.empty': 'Email không được để trống',
		}),
	password: Joi.string().required().messages({
		'string.empty': 'Mật khẩu không được để trống',
	}),
});

const SignIn = () => {
	const [showPassword, setShowPassword] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const { user } = useSelector((state: RootState) => state.client);

	useEffect(() => {
		if (user.name) {
			navigate('/');
		}
	}, [user, navigate]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IUser>({
		resolver: joiResolver(schema),
	});
	const onSubmit = async (data: IUser) => {
		try {
			setLoading(true);
			const response = await authService.login(data);
			if (response.data.success) {
				Cookies.set('user', JSON.stringify(response.data.user));
				Cookies.set('access_token', response.data.access_token);
				Cookies.set('refresh_token', response.data.refresh_token);
				dispatch(login(response.data.user));
				toast.success(response.data.message);
				navigate('/');
			} else {
				toast.error(response.data.message);
			}
		} catch (error: any) {
			toast.error('Email hoặc mật khẩu không hợp lệ');
		} finally {
			setLoading(false);
		}
	};

	const responseFacebook = async (response: any) => {
		if (response.accessToken) {
			try {
				setLoading(true);
				const serverResponse = await authService.loginWithFacebook({
					access_token: response.accessToken,
				});

				if (serverResponse.data.success) {
					console.log(serverResponse);
					Cookies.set('user', JSON.stringify(serverResponse.data.user));
					Cookies.set('access_token', serverResponse.data.access_token);
					Cookies.set('refresh_token', serverResponse.data.refresh_token);
					dispatch(login(serverResponse.data.user));
					toast.success(serverResponse.data.message);

					navigate('/');
				} else {
					toast.error(serverResponse.data.message);
				}
			} catch (error) {
				console.error('Lỗi đăng nhập Facebook:', error);
				toast.error('Đăng nhập Facebook thất bại. Vui lòng thử lại.');
			} finally {
				setLoading(false);
			}
		} else {
			console.error('Đăng nhập Facebook thất bại:', response);
			toast.error('Đăng nhập Facebook thất bại.');
		}
	};

	return (
		<>
			<div className="h-screen">
				<Navbar />
				<div className="flex justify-between items-center container max-w-5xl mx-auto mt-10 px-5 md:px-8 lg:px-0">
					<div className="relative w-full lg:w-2/3 hidden lg:flex justify-start items-center">
						<div className="flex flex-col gap-5">
							<h1 className="text-4xl font-bold">Đăng nhập vào</h1>
							<h1 className="text-5xl font-bold italic text-[#40BFFF]">
								GoShoes
							</h1>
							<p className="text-md text-black text-left">
								Nếu bạn chưa có tài khoản <br />
								Bạn có thể{' '}
								<Link to="/signup" className="text-[#40BFFF] font-bold">
									Đăng ký tại đây!
								</Link>
							</p>
						</div>
						<img
							// className="absolute top-0 right-0 w-100px"
							src="user_login.svg"
							alt=""
						/>
					</div>
					<div className="w-full lg:w-1/3 flex justify-center items-center">
						<form
							className="my-auto w-full"
							onSubmit={handleSubmit(onSubmit)}
						>
							<p className="text-2xl font-bold">Đăng nhập</p>
							<input
								type="text"
								placeholder="Nhập email hoặc tên người dùng"
								className="input input-bordered w-full rounded-md bg-[#f0efff] mt-5 placeholder:text-[#494949]"
								{...register('email')}
							/>
							{errors.email && (
								<p className="text-red-500 text-sm">
									{errors.email.message}
								</p>
							)}
							<label className="input input-bordered flex items-center bg-[#f0efff] mt-5 gap-2 w-full">
								<input
									type={showPassword ? 'text' : 'password'}
									className="grow placeholder:text-[#494949]"
									placeholder="Nhập mật khẩu"
									{...register('password')}
								/>
								<div
									onClick={() => setShowPassword(!showPassword)}
									className="cursor-pointer"
								>
									{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
								</div>
							</label>
							{errors.password && (
								<p className="text-red-500 text-sm">
									{errors.password.message}
								</p>
							)}
							<Link to="/forget-password" className="ms-auto">
								<p className="text-md inline-block text-[#B0B0B0] mt-3 cursor-pointer">
									Quên mật khẩu?
								</p>
							</Link>
							<button
								disabled={loading}
								className="btn bg-[#40BFFF] text-white w-full rounded-md mt-5 flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<LoadingIcon
											type="spinner"
											size="sm"
											color="ghost"
										/>{' '}
										Đang đăng nhập
									</>
								) : (
									'Đăng nhập'
								)}
							</button>
							<p className="text-md text-[#B0B0B0] text-center my-10">
								hoặc tiếp tục với
							</p>
							<div className="flex justify-center items-center gap-5 mt-5">
								<FacebookLogin
									appId={env.FACEBOOK_APP_ID}
									autoLoad={false}
									fields="name,email,picture"
									callback={responseFacebook}
									icon="fa-facebook"
									size="small"
									render={(renderProps) => (
										<img
											onClick={() => renderProps.onClick()}
											className="w-8 cursor-pointer"
											src="images/fb_logo.png"
											alt=""
										/>
									)}
								/>
								{/* <img
									className="w-8"
									src="images/google_logo.webp"
									alt=""
								/> */}
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default SignIn;
