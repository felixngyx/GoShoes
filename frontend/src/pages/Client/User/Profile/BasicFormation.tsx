import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProfileParams } from '../../../../types/client/profile';
import Cookies from 'js-cookie';
// import { setUser } from '../../../../store/client/userSlice';

interface ProfileFormProps {
	profile: any;
	handleUpdateProfile: (data: ProfileParams) => void;
	handleSendEmailChangeRequest: (email: string) => void;
	handleSendPhoneChangeRequest: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	profile,
	handleUpdateProfile,
	handleSendEmailChangeRequest,
	handleSendPhoneChangeRequest,
}) => {
	const [emailToChange, setEmailToChange] = useState<string | null>(null);
	const [phoneToChange, setPhoneToChange] = useState<string | null>(null);
	const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
	const [authProvider, setAuthProvider] = useState<string | null>(null);

	useEffect(() => {
		const userInfo = Cookies.get('user');

		if (userInfo) {
			const userData = JSON.parse(userInfo);
			console.log(userData);
			setIsVerifyingEmail(userData.email_is_verified);
			setAuthProvider(userData.auth_provider);
		}
	}, []);


	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<ProfileParams>({
		defaultValues: {
			name: profile?.name || '',
			email: profile?.email || '',
			phone: profile?.phone ?? '',
			bio: profile?.bio || '',
			avt: profile?.avt || '',
			gender: profile?.gender || '',
			birth_date: profile?.birth_date || '',
		},
	});

	const [isChangingEmail, setIsChangingEmail] = useState(false);
	const [isChangingPhone, setIsChangingPhone] = useState(false);
	const watchEmail = watch('email');
	const watchPhone = watch('phone');

	useEffect(() => {
		if (profile) {
			setValue('name', profile.name);
			setValue('email', profile.email);
			setValue('phone', profile.phone);
			setValue('bio', profile.bio);
			setValue('avt', profile.avt);
			setValue('gender', profile.gender);
			setValue('birth_date', profile.birth_date);
		}

		// Nếu có email hoặc số điện thoại đang chờ thay đổi, hiển thị lại
		if (emailToChange) {
			setValue('email', emailToChange);
		}

		if (phoneToChange) {
			setValue('phone', phoneToChange);
		}
	}, [profile, emailToChange, phoneToChange, setValue]);

	const onSubmit = async (data: ProfileParams) => {
		const updatedData: ProfileParams = {
			...data,
		};

		// Nếu email thay đổi, gửi yêu cầu thay đổi email
		if (watchEmail !== profile?.email && watchEmail !== '') {
			updatedData.email = watchEmail;
			handleSendEmailChangeRequest(watchEmail); // Gửi yêu cầu thay đổi email
			setEmailToChange(watchEmail); // Lưu email đang thay đổi
		}

		// Nếu số điện thoại thay đổi, gửi yêu cầu thay đổi số điện thoại
		if (watchPhone !== profile?.phone && watchPhone !== '') {
			updatedData.phone = watchPhone;
			handleSendPhoneChangeRequest(); // Gửi yêu cầu thay đổi số điện thoại
			setPhoneToChange(watchPhone); // Lưu số điện thoại đang thay đổi
		}

		// Gọi hàm cập nhật thông tin cá nhân
		handleUpdateProfile(updatedData);
	};

	return (
		<div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-3">
			<form
				className="grid grid-cols-2 gap-x-5 gap-y-4"
				onSubmit={handleSubmit(onSubmit)}
			>
				{/* Trường nhập tên */}
				<label className="form-control col-span-2 sm:col-span-1">
					<div className="label">
						<span className="label-text font-medium text-base">
							Tên người dùng
						</span>
					</div>
					<input
						type="text"
						placeholder="Nhập tại đây"
						className="input input-bordered w-full"
						{...register('name')}
					/>
				</label>

				{/* Email */}
				<div className="form-control">
					<label className="label">
						<span className="label-text text-base font-medium">Email</span>
					</label>
					<div className="relative">
						<input
							type="email"
							className="input input-bordered w-full pr-24"
							readOnly
							{...register('email')}
						/>
						{authProvider !== 'facebook' && (
							<button
								type="button"
								className="btn btn-link btn-sm absolute right-0 top-0 h-full px-3 text-sm font-medium text-blue-500 hover:underline"
								onClick={() => handleSendEmailChangeRequest(watchEmail)}
							>
								{isChangingEmail ? 'Đang thay đổi...' : 'Thay đổi'}
							</button>
						)}
					</div>
				</div>

				{/* Số điện thoại */}
				<div className="form-control">
					<label className="label">
						<span className="label-text text-base font-medium">Số điện thoại</span>
					</label>
					<div className="relative">
						<input
							type="text"
							className="input input-bordered w-full pr-24"
							readOnly
							{...register('phone')}
						/>
						<button
							type="button"
							className="btn btn-link btn-sm absolute right-0 top-0 h-full px-3 text-sm font-medium text-blue-500 hover:underline"
							onClick={handleSendPhoneChangeRequest}
						>
							{isChangingPhone ? 'Đang thay đổi...' : 'Thay đổi'}
						</button>
					</div>
				</div>

				{/* Giới tính */}
				<label className="form-control col-span-2 sm:col-span-1">
					<div className="label">
						<span className="label-text font-medium text-base">Giới tính</span>
					</div>
					<select
						className="select select-bordered w-full"
						{...register('gender')}
					>
						<option value="male">Nam</option>
						<option value="female">Nữ</option>
					</select>
				</label>

				{/* Ngày sinh */}
				<label className="form-control col-span-2 sm:col-span-1">
					<div className="label">
						<span className="label-text font-medium text-base">Ngày sinh</span>
					</div>
					<input
						type="date"
						className="input input-bordered w-full"
						{...register('birth_date')}
						placeholder="YYYY-MM-DD"
					/>
				</label>

				{/* Tiểu sử */}
				<label className="form-control col-span-2">
					<div className="label">
						<span className="label-text font-medium text-base">Tiểu sử</span>
					</div>
					<textarea
						placeholder="Nhập tại đây"
						className="textarea textarea-bordered w-full"
						{...register('bio')}
					/>
				</label>

				{/* Nút cập nhật */}
				<button
					type="submit"
					disabled={!isVerifyingEmail}
					className={`btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] col-span-2 mt-5 ${isVerifyingEmail ? '' : 'btn-disabled'
						}`}
				>
					{isVerifyingEmail
						? 'Cập nhật'
						: 'Vui lòng xác minh email trước khi cập nhật thông tin'}
				</button>
			</form>
		</div>
	);
};

export default ProfileForm;
