import { PencilLine, Plus, Trash2, Eye, Upload, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BRAND } from '../../../services/admin/brand';
import brandService from '../../../services/admin/brand';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';
import { FaRegTrashAlt } from 'react-icons/fa';
import uploadImageToCloudinary from '../../../common/uploadCloudinary';

// Update schema validation
const schema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Brand name is required',
	}),
	logo_url: Joi.string().required().messages({
		'string.empty': 'Logo is required',
	}),
});

// Update PaginationType to ensure all fields are numbers
type PaginationType = {
	page: number;
	limit: number;
	total: number;
};

const Brand = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBrand, setEditingBrand] = useState<BRAND | null>(null);

	const [brands, setBrands] = useState<BRAND[]>([]);

	const [pagination, setPagination] = useState<PaginationType>({
		page: 1,
		limit: 5, // Make sure this is a number
		total: 0,
	});

	const [loading, setLoading] = useState<boolean>(false);

	const [imageFile, setImageFile] = useState<File | string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const fetchBrands = async () => {
		try {
			setLoading(true);
			const res = await brandService.getAll(
				pagination.page,
				Number(pagination.limit)
			);
			if (res?.data?.data?.brands) {
				setBrands(res.data.data.brands || []);
				const paginationData = res.data.data.pagination;
				setPagination({
					page: Number(paginationData.current_page || 1),
					limit: Number(paginationData.per_page || 5),
					total: Number(paginationData.total || 0),
				});
			}
		} catch (error) {
			console.error('Error fetching brands:', error);
			toast.error('Không thể tải danh sách thương hiệu');
		} finally {
			setLoading(false);
		}
	};

	const deleteBrand = async (id: string) => {
		try {
			if (window.confirm('Are you sure you want to delete this brand?')) {
				await brandService.delete(id);
				toast.success('Brand deleted successfully');
				fetchBrands();
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'An error occurred');
		}
	};

	useEffect(() => {
		fetchBrands();
	}, [pagination.page]); // Change dependency from pagination.page to pagination.current_page

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({
			...prev,
			page: page,
		}));
	};

	const renderPaginationButtons = () => {
		const total = Number(pagination.total) || 0;
		const limit = Number(pagination.limit) || 5;
		const totalPages = Math.max(1, Math.ceil(total / limit));

		if (totalPages <= 0) return null;

		const buttons = [];

		// First page button with updated active class
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

			// Current page and surrounding pages with updated active class
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

			// Last page button with updated active class
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

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(brands.map((_, index) => index)); // Select all
		}
		setSelectAll(!selectAll); // Toggle select all state
	};

	const handleSelectItem = (index: number) => {
		if (selectedItems.includes(index)) {
			setSelectedItems(selectedItems.filter((item) => item !== index)); // Deselect item
		} else {
			setSelectedItems([...selectedItems, index]); // Select item
		}
	};

	const openAddModal = () => {
		setEditingBrand(null);
		setIsModalOpen(true);
	};

	const openEditModal = (brand: BRAND) => {
		setEditingBrand(brand);
		reset({
			name: brand.name,
			logo_url: brand.logo_url,
		});
		setImageFile(brand.logo_url);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingBrand(null);
		reset(); // Reset form when closing
	};

	const modalRef = useRef<HTMLDivElement>(null);

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

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		setValue,
		clearErrors,
	} = useForm<BRAND>({
		resolver: joiResolver(schema),
		defaultValues: {
			name: '',
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
			setValue('logo_url', file.name);
			clearErrors('logo_url');
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setValue('logo_url', '');
	};

	const handleUploadClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		fileInputRef.current?.click();
	};

	const openPreviewModal = (imageSrc: string) => {
		setPreviewImage(imageSrc);
	};

	const onSubmit = async (data: BRAND) => {
		try {
			if (editingBrand) {
				// Handle edit
				setIsModalOpen(false);
				toast.loading('Updating brand');
				if (imageFile instanceof File) {
					data.logo_url = await uploadImageToCloudinary(imageFile);
				} else {
					data.logo_url = imageFile as string;
				}
				await brandService.update(editingBrand.id!.toString(), data);
				toast.dismiss();
				toast.success('Brand updated successfully');
			} else {
				// Handle add
				setIsModalOpen(false);
				toast.loading('Processing add brand');
				const logo = await uploadImageToCloudinary(imageFile as File);
				await brandService.create({
					...data,
					logo_url: logo,
				});
				toast.dismiss();
				toast.success('Brand added successfully');
			}
			await fetchBrands();
			closeModal();
			reset();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Something went wrong');
		}
	};

	// Add useEffect to handle form reset when editingBrand changes
	useEffect(() => {
		if (editingBrand) {
			reset({
				name: editingBrand.name,
				logo_url: editingBrand.logo_url,
			});
			setImageFile(editingBrand.logo_url);
		} else {
			reset({
				name: '',
			});
			setImageFile(null);
		}
	}, [editingBrand, reset]);

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5 col-span-1">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Danh sách thương hiệu
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
						Thêm thương hiệu
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
								Logo
							</th>
							<th scope="col" className="px-6 py-3 w-1/5">
								Thao tác
							</th>
						</tr>
					</thead>
					{loading ? (
						<tbody>
							<tr>
								<td colSpan={3} className="h-24">
									<div className="flex items-center justify-center h-full">
										<LoadingIcon
											type="spinner"
											size="lg"
											color="info"
										/>
									</div>
								</td>
							</tr>
						</tbody>
					) : (
						<tbody>
							{brands.map((brand, key) => (
								<tr
									className={`bg-white dark:bg-slate-800 ${key !== brands.length - 1
										? 'border-b border-stroke'
										: ''
										}`}
									key={key}
								>
									<td className="w-4 p-4">
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
									<td className="px-6 py-3">{brand.name}</td>
									<td className="px-6 py-3">
										<img
											src={brand.logo_url}
											alt="Logo thương hiệu"
											className="w-10 h-10 object-cover rounded-md"
										/>
									</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
											onClick={() => openEditModal(brand)}
										>
											<PencilLine size={16} />
										</button>
										<button
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
											onClick={() =>
												deleteBrand(brand.id!.toString())
											}
										>
											<Trash2 size={16} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					)}
				</table>
			</div>

			<div className="join ms-auto">{renderPaginationButtons()}</div>

			{/* Thêm/Sửa thương hiệu Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div
						ref={modalRef}
						className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/3"
					>
						<h2 className="text-xl font-semibold mb-4">
							{editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div>
								<label htmlFor="name" className="text-sm font-bold">
									Tên thương hiệu
								</label>
								<input
									type="text"
									className="w-full p-2 border rounded"
									placeholder="Tên thương hiệu"
									{...register('name')}
								/>
								{errors.name && (
									<p className="text-red-500 text-sm mt-1">
										{errors.name.message}
									</p>
								)}
							</div>

							<div>
								<label htmlFor="logo_url" className="text-sm font-bold">
									Logo
								</label>
								<input
									{...register('logo_url')}
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
												alt="Xem trước logo thương hiệu"
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
											className="size-[100px] flex flex-col gap-2 items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer"
										>
											<Upload />
											<p className="text-xs text-gray-500">
												Tải lên logo
											</p>
										</div>
									)}
								</div>
								{errors.logo_url && (
									<p className="text-red-500 text-sm mt-1">
										{errors.logo_url.message}
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
									{editingBrand ? 'Lưu thay đổi' : 'Thêm thương hiệu'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

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
		</div>
	);
};

export default Brand;
