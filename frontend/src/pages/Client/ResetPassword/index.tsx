import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	return (
		<div className="flex items-center justify-center h-[calc(100vh-10rem)]">
			<div className="bg-white p-8 rounded-lg shadow-md w-96 border border-stroke">
				<h2 className="text-2xl font-bold mb-6 text-center">
					Đặt Lại Mật Khẩu
				</h2>
				<form className="flex flex-col gap-5">
					<label className="input input-bordered flex items-center bg-[#f0efff] gap-2">
						<input
							type={showPassword ? 'text' : 'password'} // Toggle input type based on state
							className="grow placeholder:text-[#494949]"
							placeholder="Mật Khẩu Mới"
						/>
						<div
							onClick={() => setShowPassword(!showPassword)}
							className="cursor-pointer"
						>
							{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
						</div>
					</label>
					<label className="input input-bordered flex items-center bg-[#f0efff] gap-2">
						<input
							type={showPassword ? 'text' : 'password'} // Toggle input type based on state
							className="grow placeholder:text-[#494949]"
							placeholder="Xác Nhận Mật Khẩu"
						/>
						<div
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
							className="cursor-pointer"
						>
							{showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
						</div>
					</label>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
					>
						Đặt Lại Mật Khẩu
					</button>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
