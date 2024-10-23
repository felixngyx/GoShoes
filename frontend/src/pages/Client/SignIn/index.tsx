import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Navbar from '../../../components/client/Navbar';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
import { env } from '../../../environment/env';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import { IUser } from '../../../types/client/user';
import { joiResolver } from '@hookform/resolvers/joi';
import authService from '../../../services/client/auth';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { login } from '../../../store/client/userSlice';
import toast from 'react-hot-toast';

const schema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			'string.email': 'Invalid email address',
			'string.empty': 'Email is required',
		}),
	password: Joi.string().required().messages({
		'string.empty': 'Password is required',
	}),
});

const SignIn = () => {
	const [showPassword, setShowPassword] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IUser>({
		resolver: joiResolver(schema),
	});
	const onSubmit = async (data: IUser) => {
		try {
			const response = await authService.login(data);
			Cookies.set('access_token', response.data.token);
			dispatch(login(response.data.user));
			toast.success(response.data.message);
			navigate('/');
		} catch (error: any) {
			toast.error(error.response.data.message);
		}
	};

	const responseFacebook = (response: any) => {
		if (response.accessToken) {
			dispatch(
				login({
					username: response.name,
					email: response.email,
				})
			);
			Cookies.set('access_token', response.accessToken);
			toast.success('Login successful');
			navigate('/');
		} else {
			console.error('Facebook login failed:', response);
		}
	};

	return (
		<>
			<div className="h-screen">
				<Navbar />
				<div className="flex justify-between items-center container max-w-5xl mx-auto mt-10">
					<div className="relative w-2/3 flex justify-start items-center">
						<div className="flex flex-col gap-5">
							<h1 className="text-4xl font-bold">Sign in to</h1>
							<h1 className="text-5xl font-bold italic text-[#40BFFF]">
								GoShoes
							</h1>
							<p className="text-md text-black text-left">
								If you don't have an account <br />
								You can{' '}
								<Link to="/signup" className="text-[#40BFFF] font-bold">
									Register here!
								</Link>
							</p>
						</div>
						<img
							// className="absolute top-0 right-0 w-100px"
							src="user_login.svg"
							alt=""
						/>
					</div>
					<div className="w-1/3 flex justify-center items-center">
						<form
							className="my-auto w-full"
							onSubmit={handleSubmit(onSubmit)}
						>
							<p className="text-2xl font-bold">Sign in</p>
							<input
								type="text"
								placeholder="Enter email or username"
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
									placeholder="Enter password"
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
									Forgot your password?
								</p>
							</Link>
							<button className="btn bg-[#40BFFF] text-white w-full rounded-md mt-5">
								Sign in
							</button>
							<p className="text-md text-[#B0B0B0] text-center my-10">
								or continue with
							</p>
							<div className="flex justify-center items-center gap-5 mt-5">
								<FacebookLogin
									appId={env.FACEBOOK_APP_ID}
									autoLoad={true}
									fields="name,email,picture"
									callback={responseFacebook}
									textButton=""
									icon="fa-facebook"
									size="small"
								/>
								<img
									className="w-8"
									src="images/google_logo.webp"
									alt=""
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default SignIn;
