import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { profileSchema } from './Schema/profileSchema'; // Đảm bảo đường dẫn đúng
import useProfile from '../../../hooks/client/useProfile'; // Import hook custom
import { ProfileParams } from '../../../services/client/profile';

const Profile = () => {
	const { profileData, isLoading, handleUpdateProfile } = useProfile(); // Dùng hook để lấy và cập nhật profile

	// Khởi tạo useForm với joiResolver và profileSchema
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileParams>({
		resolver: joiResolver(profileSchema), // Kết nối Joi vào form
	});

	// Hàm xử lý khi submit form
	const onSubmit = (data: ProfileParams) => {
		handleUpdateProfile(data); // Gọi API cập nhật profile
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="col-span-9 gap-10 grid grid-cols-3">
			<div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-3">
				<h1 className="text-2xl font-semibold">Basic information</h1>
				<form
					className="grid grid-cols-2 gap-x-5 gap-y-2"
					onSubmit={handleSubmit(onSubmit)}
				>
					<label className="form-control col-span-1">
						<div className="label">
							<span className="label-text font-medium text-base">
								First name
							</span>
						</div>
						<input
							type="text"
							placeholder="Type here"
							className="input input-bordered w-full"
							{...register('name')} // Kết nối với field 'name'
						/>
						{errors.name && (
							<p className="text-red-500">{errors.name?.message}</p>
						)}{' '}
						{/* Hiển thị lỗi nếu có */}
					</label>

					<label className="form-control col-span-1">
						<div className="label">
							<span className="label-text font-medium text-base">
								Email
							</span>
						</div>
						<input
							type="text"
							placeholder="Type here"
							className="input input-bordered w-full"
							{...register('email')} // Kết nối với field 'email'
						/>
						{errors.email && (
							<p className="text-red-500">{errors.email?.message}</p>
						)}
					</label>

					<label className="form-control col-span-1">
						<div className="label">
							<span className="label-text font-medium text-base">
								Phone number
							</span>
						</div>
						<input
							type="text"
							placeholder="Type here"
							className="input input-bordered w-full"
							{...register('phone')} // Kết nối với field 'phone'
						/>
						{errors.phone && (
							<p className="text-red-500">{errors.phone?.message}</p>
						)}
					</label>

					<label className="form-control col-span-2">
						<div className="label">
							<span className="label-text font-medium text-base">
								Address
							</span>
						</div>
						<textarea
							placeholder="Type here"
							className="textarea textarea-bordered"
							{...register('address')} // Kết nối với field 'address'
						/>
						{errors.address && (
							<p className="text-red-500">{errors.address?.message}</p>
						)}
					</label>

					<button
						type="submit"
						className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] col-span-2 mt-5"
					>
						Update
					</button>
				</form>
			</div>

			<form className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-1 flex flex-col gap-5">
				<h1 className="text-2xl font-semibold">Change avatar</h1>
				<div className="avatar">
					<div className="ring-primary ring-offset-base-100 w-32 rounded-full ring ring-offset-2">
						<img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
					</div>
				</div>
				<input
					type="file"
					className="file-input file-input-bordered file-input-xs w-fit"
				/>
				<button className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] w-[50%]">
					Update
				</button>
			</form>

			<div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-2">
				<h1 className="text-2xl font-semibold">Change password</h1>
				<form className="grid grid-cols-2 gap-x-5 gap-y-2">
					<label className="form-control col-span-2">
						<div className="label">
							<span className="label-text font-medium text-base">
								Old password
							</span>
						</div>
						<input
							type="password"
							placeholder="Type here"
							className="input input-bordered w-full"
						/>
					</label>
					<label className="form-control col-span-1">
						<div className="label">
							<span className="label-text font-medium text-base">
								New password
							</span>
						</div>
						<input
							type="password"
							placeholder="Type here"
							className="input input-bordered w-full"
						/>
					</label>
					<label className="form-control col-span-1">
						<div className="label">
							<span className="label-text font-medium text-base">
								Confirm new password
							</span>
						</div>
						<input
							type="password"
							placeholder="Type here"
							className="input input-bordered w-full"
						/>
					</label>
					<button className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] col-span-2 mt-5">
						Update
					</button>
				</form>
			</div>
		</div>
	);
};

export default Profile;
