import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Navbar from '../../../components/client/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import authService from '../../../services/client/auth';
import toast from 'react-hot-toast';

// Define the schema for form validation
const schema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.messages({
			'string.email': 'Invalid email address',
			'string.empty': 'Email is required',
		}),
	name: Joi.string().required().messages({
		'string.empty': 'Username is required',
	}),
	password: Joi.string().min(6).required().messages({
		'string.empty': 'Password is required',
		'string.min': 'Password must be at least 6 characters long',
	}),
	confirmPassword: Joi.string()
		.valid(Joi.ref('password'))
		.required()
		.valid(Joi.ref('password'))
		.messages({
			'any.required': 'Confirm Password is required',
			'any.only': 'Confirm Password do not match',
		}),
});

// Define the interface for the form data
interface ISignUpForm {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
}

const SignUp = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ISignUpForm>({
		resolver: joiResolver(schema),
	});

	const onSubmit = async (data: ISignUpForm) => {
		try {
			console.log(data);
			const response = await authService.register(data);
			console.log(response);
			// toast.success(response.data.message);
			// navigate('/signin');
		} catch (error: any) {
			toast.error(error.response.data.message);
		}
	};

	return (
		<>
			<div className="h-screen">
				<Navbar />
				<div className="flex justify-between items-center container max-w-5xl mx-auto mt-10">
					<div className="flex justify-start w-2/3">
						<div className="flex flex-col gap-5 justify-center">
							<h1 className="text-4xl font-bold">Sign up to</h1>
							<h1 className="text-5xl font-bold text-[#40BFFF] italic">
								GoShoes
							</h1>
							<p className="text-md text-black text-left">
								If you already have an account <br />
								You can{' '}
								<Link to="/signin" className="text-[#40BFFF] font-bold">
									Sign in here!
								</Link>
							</p>
						</div>
						<img src="user_login.svg" alt="" />
					</div>
					<div className="w-1/3 flex justify-center items-center">
						<form onSubmit={handleSubmit(onSubmit)} className="w-full">
							<p className="text-2xl font-bold">Sign up</p>
							<input
								type="text"
								placeholder="Enter email"
								className="input input-bordered w-full rounded-md bg-[#f0efff] mt-5 placeholder:text-[#494949]"
								{...register('email')}
							/>
							{errors.email && (
								<p className="text-red-500 text-sm">
									{errors.email.message}
								</p>
							)}
							<input
								type="text"
								placeholder="Enter username"
								className="input input-bordered w-full rounded-md bg-[#f0efff] mt-5 placeholder:text-[#494949]"
								{...register('name')}
							/>
							{errors.name && (
								<p className="text-red-500 text-sm">
									{errors.name.message}
								</p>
							)}
							<label className="input input-bordered flex items-center bg-[#f0efff] mt-5 gap-2">
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
							<label className="input input-bordered flex items-center bg-[#f0efff] mt-5 gap-2">
								<input
									type={showConfirmPassword ? 'text' : 'password'}
									className="grow placeholder:text-[#494949]"
									placeholder="Enter confirm password"
									{...register('confirmPassword')}
								/>
								<div
									onClick={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
									className="cursor-pointer"
								>
									{showConfirmPassword ? (
										<FaRegEyeSlash />
									) : (
										<FaRegEye />
									)}
								</div>
							</label>
							{errors.confirmPassword && (
								<p className="text-red-500 text-sm">
									{errors.confirmPassword.message}
								</p>
							)}

							<button
								type="submit"
								className="btn bg-[#40BFFF] text-white w-full rounded-md mt-5"
							>
								Sign up
							</button>

							<p className="text-md text-[#B0B0B0] text-center my-10">
								or continue with
							</p>
							<div className="flex justify-center items-center gap-5 mt-5">
								<img
									className="w-8 cursor-pointer"
									src="images/fb_logo.png"
									alt=""
								/>
								<img
									className="w-8 cursor-pointer"
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

export default SignUp;
