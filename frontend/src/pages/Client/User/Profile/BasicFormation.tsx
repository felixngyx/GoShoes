import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { profileUpdateSchema } from '../Schema/profileSchema';
import { ProfileParams } from '../../../../types/client/profile';
import toast from 'react-hot-toast';

interface ProfileFormProps {
  profile: any;
  selectedLocation: any;
  handleUpdateProfile: (data: ProfileParams) => void;
  handleLocationSelect: () => void;
  handleSendEmailChangeRequest: (email: string) => void;
  handleVerifyTokenChangePhone: (token: string, phone: string) => void;
  handleSendPhoneChangeRequest: () => void;
  handleVerifyTokenChangeEmail: (token: string, email: string) => void;
  isSendingPhone: boolean;
  isVerifyingPhoneToken: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  selectedLocation,
  handleUpdateProfile,
  handleLocationSelect,
  handleSendEmailChangeRequest,
  handleVerifyTokenChangePhone,
  handleSendPhoneChangeRequest,
  handleVerifyTokenChangeEmail,
  isSendingPhone,
  isVerifyingPhoneToken,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileParams>({
    resolver: joiResolver(profileUpdateSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone ?? '',
      bio: profile?.bio || '',
      avt: profile?.avt || '',
      gender: profile?.gender || '',
      birth_date: profile?.birth_date || '',
      address: selectedLocation?.shipping_detail.address || '',
    },
  });

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

    if (selectedLocation) {
      setValue('address', selectedLocation.shipping_detail.address);
    }
  }, [profile, selectedLocation, setValue]);

  const onSubmit = async (data: ProfileParams) => {
    const updatedData: ProfileParams = {
      ...data,
      address: selectedLocation?.shipping_detail?.address,
    };

    // Nếu email thay đổi, gửi yêu cầu thay đổi email
    if (watchEmail !== profile?.email) {
      updatedData.email = watchEmail;
      handleSendEmailChangeRequest(watchEmail); // Gửi yêu cầu thay đổi email
    }

    // Nếu số điện thoại thay đổi, gửi yêu cầu thay đổi số điện thoại
    if (watchPhone !== profile?.phone) {
      updatedData.phone = watchPhone;
      handleSendPhoneChangeRequest(); // Gửi yêu cầu thay đổi số điện thoại
    }

    // Gọi hàm cập nhật profile
    handleUpdateProfile(updatedData);

  };

  return (
    <div className="p-5 rounded-lg border border-gray-200 shadow-lg col-span-3">
      <form className="grid grid-cols-2 gap-x-5 gap-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Các trường nhập liệu */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">UserName</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full"
            {...register('name')}
          />
          {errors.name && <p className="text-red-500">{errors.name?.message}</p>}
        </label>

        {/* Email */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Email</span>
          </div>
          <input
            type="email"
            placeholder="Type here"
            className="input input-bordered w-full"
            {...register('email')}
          />
          {errors.email && <p className="text-red-500">{errors.email?.message}</p>}
        </label>

        {/* Phone */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Phone number</span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full"
            {...register('phone')}
          />
          {errors.phone && <p className="text-red-500">{errors.phone?.message}</p>}
        </label>

        {/* Gender */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Gender</span>
          </div>
          <select className="select select-bordered w-full" {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500">{errors.gender?.message}</p>}
        </label>

        {/* Birth date */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Birth date</span>
          </div>
          <input
            type="date"
            className="input input-bordered w-full"
            {...register('birth_date')}
            placeholder="YYYY-MM-DD"
          />
          {errors.birth_date && <p className="text-red-500">{errors.birth_date?.message}</p>}
        </label>

        {/* Address */}
        <label className="form-control col-span-2 sm:col-span-1">
          <div className="label">
            <span className="label-text font-medium text-base">Address</span>
          </div>
          <input
            type="text"
            placeholder="Address"
            className="input input-bordered w-full"
            value={selectedLocation?.shipping_detail?.address || ''}
            disabled
          />
          <button
            type="button"
            onClick={handleLocationSelect}
            className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] mt-2"
          >
            Select Address
          </button>
        </label>

        {/* Bio */}
        <label className="form-control col-span-2">
          <div className="label">
            <span className="label-text font-medium text-base">Bio</span>
          </div>
          <textarea
            placeholder="Type here"
            className="textarea textarea-bordered w-full"
            {...register('bio')}
          />
          {errors.bio && <p className="text-red-500">{errors.bio?.message}</p>}
        </label>

        <button type="submit" className="btn btn-sm bg-[#40BFFF] text-white hover:bg-[#259CFA] col-span-2 mt-5">
          Update
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
