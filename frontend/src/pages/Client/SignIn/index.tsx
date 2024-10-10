import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import Navbar from '../../../components/client/Navbar';
import { useState } from 'react'; // Add this import

const SignIn = () => {
	const [showPassword, setShowPassword] = useState(false); // Add state for password visibility

	return (
		<>
			<div className="h-screen">
				<Navbar />
				<div className="flex justify-between items-center container max-w-5xl mx-auto h-full">
					<div className="flex flex-col justify-center items-start relative w-2/3 h-full">
						<h1 className="text-5xl font-bold">Sign in to</h1>
						<h1 className="text-4xl font-bold">Lorem Ipsum is simply</h1>
						<p className="text-md text-black text-left mt-5">
							If you don't have an account <br />
							You can{' '}
							<span className="text-[#40BFFF] font-bold">
								Register here!
							</span>
						</p>
						<img
							className="absolute top-1/2 right-20"
							src="user_login.svg"
							alt=""
						/>
					</div>
					<div className="w-1/3 h-full flex justify-center items-center">
						<form className="my-auto w-full">
							<p className="text-2xl font-bold">Sign in</p>
							<input
								type="text"
								placeholder="Enter email or username"
								className="input input-bordered w-full rounded-md bg-[#f0efff] mt-5 placeholder:text-[#494949]"
							/>
							<label className="input input-bordered flex items-center bg-[#f0efff] mt-5 gap-2">
								<input
									type={showPassword ? 'text' : 'password'} // Toggle input type based on state
									className="grow placeholder:text-[#494949]"
									placeholder="Enter password"
								/>
								<div
									onClick={() => setShowPassword(!showPassword)}
									className="cursor-pointer"
								>
									{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
								</div>
							</label>
							<p className="text-md text-[#B0B0B0] text-right mt-3 cursor-pointer">
								Forgot your password?
							</p>

							<button className="btn bg-[#40BFFF] text-white w-full rounded-md mt-5">
								Sign in
							</button>

							<p className="text-md text-[#B0B0B0] text-center my-10">
								or continue with
							</p>
							<div className="flex justify-center items-center gap-5 mt-5">
								<img className="w-8" src="images/fb_logo.png" alt="" />
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
