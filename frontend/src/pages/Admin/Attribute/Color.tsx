import React, { useState } from 'react';

import { COLOR } from '../../../services/admin/color';
import { PencilLine, Plus, Trash2, Eye, Upload, X } from 'lucide-react';
import { useRef, useEffect } from 'react';
import colorService from '../../../services/admin/color';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';
import uploadImageToCloudinary from '../../../common/uploadCloudinary';
import { FaRegTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Add schema validation
const schema = Joi.object({
	color: Joi.string().required().messages({
		'string.empty': 'Tên màu không được bỏ trống',
	}),
	link_image: Joi.string().required().messages({
		'string.empty': 'Hình ảnh không được bỏ trống',
	}),
});

type PaginationType = {
	page: number;
	limit: number;
	total: number;
};

const Color = () => {
	const [colorData, setColorData] = useState<COLOR[]>([]);
	const [selectAll, setSelectAll] = useState(false);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingColor, setEditingColor] = useState<number | null>(null);
	const [pagination, setPagination] = useState<PaginationType>({
		page: 1,
		limit: 5,
		total: 0,
	});
	const [loading, setLoading] = useState<boolean>(false);
	const [imageFile, setImageFile] = useState<File | string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setValue,
		clearErrors,
	} = useForm<COLOR>({
		resolver: joiResolver(schema),
		defaultValues: {
			color: '',
			link_image: '',
		},
	});

	const fetchColor = async () => {
		setLoading(true);
		try {
			const res = await colorService.getAll(
				pagination.page,
				pagination.limit
			);
			setColorData(res.data.clors.data);
			setPagination({
				page: Number(res.data.clors.current_page),
				limit: Number(res.data.clors.per_page),
				total: Number(res.data.clors.total),
			});
		} catch (error: any) {
			console.log(error);
			toast.error(error.response?.data?.message || 'Đã xảy ra lỗi');
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data: COLOR) => {
		setLoading(true);
		toast.loading(`${editingColor ? 'Đang cập nhật' : 'Đang thêm'} màu`);
		if (editingColor) {
			try {
				setIsModalOpen(false);
				if (imageFile instanceof File) {
					data.link_image = await uploadImageToCloudinary(imageFile);
				} else {
					data.link_image = imageFile as string;
				}
				const res = await colorService.update(Number(editingColor), data);
				if (res.status === 200) {
					fetchColor();
				}
			} catch (error: any) {
				toast.error(
					error.response?.data?.message || 'Đã xảy ra lỗi'
				);
			} finally {
				setLoading(false);
			}
		} else {
			try {
				setIsModalOpen(false);
				const image = await uploadImageToCloudinary(imageFile as File);
				const res = await colorService.create({
					...data,
					link_image: image,
				});
				if (res.status === 201) {
					fetchColor();
				}
			} catch (error: any) {
				toast.error(
					error.response?.data?.message || 'Đã xảy ra lỗi'
				);
			} finally {
				setLoading(false);
			}
		}
		toast.dismiss();
		toast.success(`${editingColor ? 'Cập nhật' : 'Thêm'} màu thành công`);
	};

	const deleteColor = async (id: number) => {
		Swal.fire({
			title: 'Xác nhận xóa',
			text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Xóa',
			cancelButtonText: 'Hủy',
			customClass: {
				popup: 'bg-white shadow rounded-lg p-4 max-w-[500px]',
				title: 'text-base font-bold text-gray-800',
				htmlContainer: 'text-sm text-gray-600',
				confirmButton:
					'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2',
				cancelButton:
					'bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400',
			},
			buttonsStyling: false,
		}).then(async (result) => {
			if (result.isConfirmed) {
				try {
					const message = toast.loading('Đang xóa màu');
					await colorService.delete(id);
					toast.dismiss(message);
					toast.success('Xóa màu thành công');
					fetchColor();
				} catch (error: any) {
					toast.error(error.response?.data?.message || 'Đã xảy ra lỗi');
				}
			}
		})

	};

	const modalRef = useRef<HTMLDivElement>(null);

	const openAddModal = () => {
		setEditingColor(null);
		reset({ color: '', link_image: '' });
		setImageFile(null);
		setIsModalOpen(true);
	};

	const openEditModal = (color: COLOR) => {
		setEditingColor(Number(color.id));
		reset({ color: color.color, link_image: color.link_image });
		setImageFile(color.link_image);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingColor(null);
		reset();
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]);
		} else {
			setSelectedItems(colorData.map((_, index) => index));
		}
		setSelectAll(!selectAll);
	};

	const handleSelectItem = (index: number) => {
		if (selectedItems.includes(index)) {
			setSelectedItems(selectedItems.filter((item) => item !== index));
		} else {
			setSelectedItems([...selectedItems, index]);
		}
	};

	const renderPaginationButtons = () => {
		const total = Number(pagination.total) || 0;
		const limit = Number(pagination.limit) || 5;
		const totalPages = Math.max(1, Math.ceil(total / limit));

		if (totalPages <= 0) return null;

		const buttons = [];

		// First page button
		buttons.push(
			<button
				key="first"
				className={`join-item btn btn-sm ${pagination.page === 1 ? 'btn-active bg-primary text-white' : ''
					}`}
				onClick={() => handlePageChange(1)}
			>
				1
			</button>
		);

		if (totalPages > 1) {
			// Show dots if there are pages between first and current
			if (pagination.page > 3) {
				buttons.push(
					<button
						key="dots1"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Current page and surrounding pages
			for (
				let i = Math.max(2, pagination.page - 1);
				i <= Math.min(totalPages - 1, pagination.page + 1);
				i++
			) {
				if (i !== 1 && i !== totalPages) {
					buttons.push(
						<button
							key={i}
							className={`join-item btn btn-sm ${pagination.page === i
								? 'btn-active bg-primary text-white'
								: ''
								}`}
							onClick={() => handlePageChange(i)}
						>
							{i}
						</button>
					);
				}
			}

			// Show dots if there are pages between current and last
			if (pagination.page < totalPages - 2) {
				buttons.push(
					<button
						key="dots2"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Last page button
			buttons.push(
				<button
					key="last"
					className={`join-item btn btn-sm ${pagination.page === totalPages
						? 'btn-active bg-primary text-white'
						: ''
						}`}
					onClick={() => handlePageChange(totalPages)}
				>
					{totalPages}
				</button>
			);
		}

		return buttons;
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
			setValue('link_image', file.name);
			clearErrors('link_image');
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setValue('link_image', '');
	};

	const handleUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const openPreviewModal = (imageSrc: string) => {
		setPreviewImage(imageSrc);
	};

	useEffect(() => {
		fetchColor();
	}, [pagination.page, pagination.limit]);

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

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5 col-span-1">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Danh sách màu
				</h4>
				<div className="flex items-center gap-2">
					<button
						className={`btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error ${selectedItems.length > 0
							? 'flex items-center gap-2'
							: 'hidden'
							}`}
					>
						<Trash2 size={16} />
						<p>Xóa {selectedItems.length} mục</p>
					</button>
					<button
						className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
						onClick={openAddModal}
					>
						<Plus size={16} />
						Thêm màu
					</button>
				</div>
			</div>

			<div className="relative overflow-x-auto border border-stroke h-full">
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="p-4">
								<div className="flex items-center">
									<input
										id="checkbox-all-search"
										type="checkbox"
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										checked={selectAll}
										onChange={handleSelectAll}
									/>
									<label
										htmlFor="checkbox-all-search"
										className="sr-only"
									>
										checkbox
									</label>
								</div>
							</th>
							<th scope="col" className="px-6 py-3 w-2/5">
								Tên
							</th>
							<th scope="col" className="px-6 py-3 w-2/5">
								Hình ảnh
							</th>
							<th scope="col" className="px-6 py-3 w-1/5">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="z-0">
						{loading ? (
							<tr>
								<td colSpan={4}>
									<div className="flex items-center justify-center">
										<LoadingIcon
											type="spinner"
											size="lg"
											color="info"
										/>
									</div>
								</td>
							</tr>
						) : (
							colorData.map((color, key) => (
								<tr
									className={`bg-white dark:bg-slate-800 ${key !== colorData.length - 1
										? 'border-b border-stroke'
										: ''
										}`}
									key={key}
								>
									<td className="w-4 p-4 h-fit">
										<div className="flex items-center">
											<input
												id={`checkbox-table-search-${key}`}
												type="checkbox"
												className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
												checked={selectedItems.includes(key)}
												onChange={() => handleSelectItem(key)}
											/>
											<label
												htmlFor={`checkbox-table-search-${key}`}
												className="sr-only"
											>
												checkbox
											</label>
										</div>
									</td>
									<td className="px-6 py-3">{color.color}</td>
									<td className="px-6 py-3">
										<img
											src={color.link_image}
											alt={color.color}
											className="w-10 h-10 object-cover rounded-full"
										/>
									</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
											onClick={() => openEditModal(color)}
										>
											<PencilLine size={16} />
										</button>
										<button
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
											onClick={() => deleteColor(Number(color.id!))}
										>
											<Trash2 size={16} />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="join ms-auto">{renderPaginationButtons()}</div>

			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div
						ref={modalRef}
						className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/3"
					>
						<h2 className="text-xl font-semibold mb-4">
							{editingColor ? 'Chỉnh sửa màu' : 'Thêm màu'}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div>
								<label htmlFor="color" className="text-sm font-medium">
									Tên màu
								</label>
								<input
									type="text"
									className="w-full p-2 border rounded"
									placeholder="Tên màu"
									{...register('color')}
								/>
								{errors.color && (
									<p className="text-red-500 text-sm mt-1">
										{errors.color.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="link_image"
									className="text-sm font-medium"
								>
									Hình ảnh
								</label>
								<input
									{...register('link_image')}
									ref={fileInputRef}
									type="file"
									className="hidden"
									onChange={handleFileChange}
									accept="image/*"
								/>

								<div className="flex gap-2">
									{imageFile ? (
										<div className="relative size-[100px] group">
											<img
												src={
													imageFile instanceof File
														? URL.createObjectURL(imageFile)
														: imageFile
												}
												alt="Xem trước màu"
												className="w-full h-full object-cover rounded-md border"
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
													className=""
												>
													<Eye color="#fff" size={18} />
												</button>
												<button
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														removeImage();
													}}
													className=""
												>
													<FaRegTrashAlt color="#fff" size={18} />
												</button>
											</div>
										</div>
									) : (
										<div
											onClick={handleUploadClick}
											className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
										>
											<Upload />
											<p className="text-xs text-gray-500">
												Tải lên hình ảnh
											</p>
										</div>
									)}
								</div>
								{errors.link_image && (
									<p className="text-red-500 text-sm mt-1">
										{errors.link_image.message}
									</p>
								)}
							</div>

							<div className="flex justify-end gap-2">
								<button
									type="button"
									className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
									onClick={closeModal}
								>
									Hủy
								</button>
								<button
									type="submit"
									className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
								>
									{editingColor ? 'Lưu thay đổi' : 'Thêm màu'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

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
		</div>
	);
};

export default Color;
