import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../services/client/profile';
import { ProfileParams } from '../../services/client/profile';
import { profileItem } from '../../types/client/profile';

const useProfile = () => {
  const [profileData, setProfileData] = useState<profileItem[]>([]);
  const [error, setError] = useState('');

  // Lấy thông tin profile
  const { data: profile =[], isLoading } = useQuery<profileItem[]>({
    queryKey: ['PROFILE'],
    queryFn: getProfile,  // Dùng API GET
  });

  // Cập nhật thông tin profile
  const { mutate: updateProfileMutation } = useMutation({
    mutationFn: updateProfile,  // Dùng API PUT
    onSuccess: (data) => {
      toast.success('Cập nhật thông tin thành công');
      setProfileData(data); // Cập nhật lại dữ liệu profile sau khi thành công
    },
    onError: (error) => {
      console.error('Lỗi khi cập nhật thông tin profile:', error);
      toast.error('Cập nhật thông tin thất bại');
    },
  });

  const handleUpdateProfile = (params: ProfileParams) => {
    updateProfileMutation(params);
  };

  return {
    profileData,
    isLoading,
    error,
    handleUpdateProfile,
  };
};

export default useProfile;
