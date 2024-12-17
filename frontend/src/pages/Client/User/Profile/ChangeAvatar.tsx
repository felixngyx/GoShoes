import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Upload, X } from 'lucide-react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import uploadImageToCloudinary from '../../../../common/uploadCloudinary';
import axiosClient from '../../../../apis/axiosClient';
import { setUser } from '../../../../store/client/userSlice';
import Cookies from 'js-cookie';

const ChangeAvatar = () => {
  const user = useSelector((state: RootState) => state.client.user);
  const [avatar, setAvatar] = useState<string | undefined>(user.avt);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | string | undefined>(user.avt);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatar(user.avt);
    setImageFile(user.avt);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(undefined);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const openPreviewModal = (imageSrc: string) => {
    setPreviewImage(imageSrc);
  };

  const handleChangeAvatar = async () => {
    if (imageFile instanceof File) {
      setIsUploading(true);
      const message = toast.loading('Đang cập nhật ảnh đại diện...');
      const urlAvatar = await uploadImageToCloudinary(imageFile);

      try {

        const response = await axiosClient.put('/profile/update', {
          avt: urlAvatar,
        });

        if (response.status === 200) {

          const userData = {
            ...user,
            avt: urlAvatar,
          }

          Cookies.set('user', JSON.stringify(userData));
          dispatch(setUser({
            user: userData
          }));
          setImageFile(urlAvatar);
          setAvatar(urlAvatar);
          toast.dismiss(message);
          toast.success('Cập nhật ảnh đại diện thành công');
        }
      } catch (error) {
        console.log('Error', error)
        toast.error('Cập nhật ảnh đại diện thất bại');
      } finally {
        setIsUploading(false);
      }

    }
  };

  return (
    <>
      <div className="p-5 rounded-lg border border-gray-200 shadow-lg flex flex-col gap-4 items-center">
        <div className="flex gap-2">
          {imageFile ? (
            <div className="relative size-[120px] group border-2 border-info rounded-full overflow-hidden">
              <img
                src={
                  imageFile instanceof File
                    ? URL.createObjectURL(imageFile)
                    : imageFile
                }
                alt="Avatar"
                className="w-full h-full object-cover rounded-full border"
              />
              <div className="absolute top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%] flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-md p-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPreviewModal(
                      imageFile instanceof File
                        ? URL.createObjectURL(imageFile)
                        : imageFile
                    );
                  }}
                >
                  <Eye color="#fff" size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <FaRegTrashAlt color="#fff" size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleUploadClick}
              className="size-[120px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-full cursor-pointer"
            >
              <Upload />
              <p className="text-xs text-gray-500">
                Upload
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
        <button
          disabled={!imageFile || imageFile === avatar || isUploading ? true : false}
          className='btn btn-sm bg-[#40BFFF] text-white'
          onClick={handleChangeAvatar}
        >
          Cập nhật Avatar
        </button>
      </div>
      {/* Modal xem trước ảnh */}
      {previewImage && (
        <dialog open className="modal">
          <div className="modal-box">
            <img src={previewImage} alt="Xem trước" className="w-full" />
            <button
              onClick={() => setPreviewImage(null)}
              className="btn btn-sm absolute right-2 top-2"
            >
              <X size={16} />
            </button>
          </div>
        </dialog>
      )}
    </>
  );
};
export default ChangeAvatar;
