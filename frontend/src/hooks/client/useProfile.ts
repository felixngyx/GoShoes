import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProfile,
  updateProfile,
  sendEmailChangeRequest,
  verifyTokenChangeEmail,
  sendPhoneChangeRequest,
  verifyTokenChangePhone
} from "../../services/client/profile";
import { ProfileParams, Profile } from '../../types/client/profile';
import { useShipping } from './useShipping';

const useProfile = () => {
  // Lấy dữ liệu Profile
  const { data: profile, isLoading, isError } = useQuery<Profile | null>({
    queryKey: ['PROFILE'],
    queryFn: getProfile,
    onError: (error: any) => {
      console.error('Error while fetching profile:', error);
      toast.error('Cannot fetch profile information');
    },
  });

  // Cập nhật Profile
  const { mutate: updateProfileMutation, isLoading: isUpdating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Error while updating profile:', error);
      toast.error('Failed to update profile');
    },
  });

  // Gửi yêu cầu thay đổi email
  const { mutate: sendEmailChangeMutation, isLoading: isSendingEmail } = useMutation({
    mutationFn: sendEmailChangeRequest,
    onSuccess: () => {
      toast.success('Email change request has been sent. Please check your email.');
    },
    onError: (error: any) => {
      console.error('Error while sending email change request:', error);
      toast.error('Failed to send email change request');
    },
  });

  // Xác minh token đổi email
  const { mutate: verifyTokenMutation, isLoading: isVerifyingToken } = useMutation({
    mutationFn: verifyTokenChangeEmail,
    onSuccess: () => {
      toast.success('Email successfully changed');
    },
    onError: (error: any) => {
      console.error('Error while verifying email change token:', error);
      toast.error('Failed to verify email change token');
    },
  });

  // Gửi yêu cầu thay đổi số điện thoại
  const { mutate: sendPhoneChangeMutation, isLoading: isSendingPhone } = useMutation({
    mutationFn: sendPhoneChangeRequest,
    onSuccess: () => {
      toast.success('Phone number change request has been sent. Please check your phone.');
    },
    onError: (error: any) => {
      console.error('Error while sending phone change request:', error);
      toast.error('Failed to send phone change request');
    },
  });

  // Xác minh token thay đổi số điện thoại
  const { mutate: verifyPhoneTokenMutation, isLoading: isVerifyingPhoneToken } = useMutation({
    mutationFn: verifyTokenChangePhone,
    onSuccess: () => {
      toast.success('Phone number successfully changed');
    },
    onError: (error: any) => {
      console.error('Error while verifying phone change token:', error);
      toast.error('Failed to verify phone change token');
    },
  });

  // Xử lý gửi yêu cầu thay đổi email
  const handleSendEmailChangeRequest = () => {
    sendEmailChangeMutation(); // Gọi mutation mà không cần tham số
  };

  // Xử lý xác minh token thay đổi email
  const handleVerifyTokenChangeEmail = (token: string, email: string) => {
    if (!token || !email) {
      toast.error('Token and email cannot be empty');
      return;
    }
    verifyTokenMutation({ token, email });
  };

  // Xử lý gửi yêu cầu thay đổi số điện thoại
  const handleSendPhoneChangeRequest = () => {
    sendPhoneChangeMutation(); // Gọi mutation mà không cần tham số
  };

  // Xử lý xác minh token thay đổi số điện thoại
  const handleVerifyTokenChangePhone = (token: string, phone: string) => {
    if (!token || !phone) {
      toast.error('Token and phone number cannot be empty');
      return;
    }
    verifyPhoneTokenMutation({ token, phone });
  };

  // Xử lý cập nhật profile
  const handleUpdateProfile = (params: ProfileParams) => {
    if (!params.name || !params.avt || !params.birth_date || !params.gender) {
      console.error('Invalid data for updating profile:', params);
      toast.error('Please check the information');
      return;
    }
    updateProfileMutation({ ...params, address: selectedLocation || undefined });
  };

  // avt
  // Xử lý thay đổi avatar
  const handleUpdateAvatar = async (base64Image: string) => {
    const updatedProfile = {
      avt: base64Image, // Sử dụng chuỗi base64 của avatar
      name: profile?.name || '', // Đảm bảo 'name' không rỗng
      email: profile?.email || '', // Đảm bảo 'email' không rỗng
      birth_date: profile?.birth_date || '', // Đảm bảo 'birth_date' không rỗng
      gender: profile?.gender || '', // Đảm bảo 'gender' không rỗng
      phone: profile?.phone ? profile.phone.toString() : '',
      bio: profile?.bio || '',
      address: profile?.address || undefined,
    };

    try {
      // Gọi API cập nhật profile
      await updateProfileMutation(updatedProfile);
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

  // Hàm chuyển file ảnh thành base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Xử lý địa chỉ
  const { selectedLocation, handleLocationSelect, handleEdit, showPopup, setShowPopup, editAddress } = useShipping();

  return {
    profile,
    isLoading,
    isUpdating,
    handleUpdateProfile,
    handleUpdateAvatar,
    handleSendEmailChangeRequest,
    handleVerifyTokenChangeEmail,
    handleSendPhoneChangeRequest,
    handleVerifyTokenChangePhone,
    selectedLocation,
    handleLocationSelect,
    handleEdit,
    showPopup,
    setShowPopup,
    editAddress,
  };
};

export default useProfile;
