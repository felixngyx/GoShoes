const ForgetPassword = () => {
	return (
		<div className="flex items-center justify-center h-[calc(100vh-10rem)]">
			<div className="bg-white p-8 rounded-lg shadow-md w-96 border border-stroke">
				<h2 className="text-2xl font-bold mb-6 text-center">
					Reset Password
				</h2>
				<form className="flex flex-col gap-5">
					<input
						type="text"
						placeholder="Email/Phone Number"
						className="input input-bordered w-full "
					/>
					<button
						type="submit"
						className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
					>
						Reset Password
					</button>
				</form>
			</div>
		</div>
	);
};

export default ForgetPassword;
