import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useProfile from '../../../../hooks/client/useProfile';
import axios from 'axios';
import { Eye, X } from 'lucide-react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { Upload } from 'lucide-react';

interface ChangeAvatarProps {
	profile: { avt: string };
}

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ profile }) => {
	const [imageFile, setImageFile] = useState<File | string | null>(
		profile?.avt || null
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const removeImage = () => {
		setImageFile(null);
	};

	const handleUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const openPreviewModal = (imageSrc: string) => {
		setPreviewImage(imageSrc);
	};

	return (
		<>
			<div className="p-5 rounded-lg border border-gray-200 shadow-lg">
				<div className="flex flex-col sm:flex-row items-center gap-6">
					<div className="flex gap-2">
						{imageFile ? (
							<div className="relative size-[150px] group">
								<img
									src={
										imageFile instanceof File
											? URL.createObjectURL(imageFile)
											: imageFile
									}
									alt="Brand logo preview"
									className="w-full h-full object-cover rounded-full border-solid border-[#40BFFF] ring-2 ring-[#40BFFF]"
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
								className="size-[150px] flex flex-col gap-2 items-center justify-center border-2 border-solid border-[#40BFFF] rounded-full cursor-pointer"
							>
								<Upload />
								<p className="text-xs text-gray-500">Upload Image</p>
							</div>
						)}
					</div>
					<div className="flex flex-col w-full gap-4">
						<input
							ref={fileInputRef}
							onChange={handleFileChange}
							type="file"
							className="file-input file-input-xs file-input-bordered w-full"
						/>
						<button className="btn btn-xs text-white w-full text-3xs bg-[#40BFFF] hover:bg-[#259CFA]">
							Update Avatar
						</button>
					</div>
				</div>
			</div>

			{previewImage && (
				<dialog open className="modal">
					<div className="modal-box">
						<img src={previewImage} alt="Preview" className="w-full" />
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
