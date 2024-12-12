import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useProfile from '../../../../hooks/client/useProfile';
import axios from 'axios';

interface ChangeAvatarProps {
  profile: { avt: string };
}

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ profile }) => {
  const { handleUpdateAvatar } = useProfile();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(profile?.avt || '/path/to/default-avatar.jpg');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validFileTypes.includes(file.type)) {
        toast.error(
          'Loại tệp không hợp lệ. Vui lòng chọn hình ảnh JPEG hoặc PNG.'
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dung lượng tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.');
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleUploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'avatar_preset');
    formData.append('cloud_name', 'doc2vx0k6');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/doc2vx0k6/image/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      toast.error('Tải ảnh lên thất bại');
      throw error;
    }
  };

  const handleUpdate = async () => {
    if (!avatarFile) {
      toast.error('Vui lòng chọn hình ảnh avatar');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedImageUrl = await handleUploadToCloudinary(avatarFile);
      await handleUpdateAvatar(uploadedImageUrl); // Cập nhật avatar với URL từ Cloudinary
      setCurrentAvatar(uploadedImageUrl); // Cập nhật URL avatar trong state
      toast.success('Cập nhật avatar thành công');
      setAvatarFile(null); // Reset sau khi cập nhật thành công
    } catch (error) {
      toast.error('Cập nhật avatar thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-lg border border-gray-200 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
            <img
              src={currentAvatar} // Sử dụng avatar hiện tại từ state
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <div className="flex flex-col w-full gap-4">
          <input
            type="file"
            className="file-input file-input-bordered file-input-xs w-full max-w-[180px] text-[10px] p-1"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <button
            className={`btn btn-xs text-white w-full max-w-[180px] ${
              isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#40BFFF] hover:bg-[#259CFA]'
            }`}
            onClick={handleUpdate}
            disabled={isUploading || !avatarFile}
          >
            {isUploading ? 'Đang tải lên...' : 'Cập nhật Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeAvatar;
