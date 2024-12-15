import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import sizeService from '../../../services/admin/size';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';
import { SIZE as SizeType } from '../../../services/admin/size';
import LoadingIcon from '../../../components/common/LoadingIcon';

// Add schema validation
const schema = Joi.object({
	size: Joi.string().required().messages({
		'string.empty': 'Size name is required',
	}),
});

// Update PaginationType to match Brand component
type PaginationType = {
	page: number;
	limit: number;
	total: number;
};

// Thêm vào đầu file, sau các import
interface ApiError {
	response?: {
		data?: {
			message?: string;
			status?: string;
		};
	};
}

const Size = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingSize, setEditingSize] = useState<string | null>(null);
	const [sizeData, setSizeData] = useState<SizeType[]>([]);
	const [pagination, setPagination] = useState<PaginationType>({
		page: 1,
		limit: 5,
		total: 0,
	});

	const [loading, setLoading] = useState<boolean>(false);

	// Fetch size data
	const fetchSize = async () => {
		setLoading(true);
		try {
			const res = await sizeService.getAll(
				pagination.page,
				pagination.limit
			);
			setSizeData(res.data.sizes.data);
			setPagination({
				page: Number(res.data.sizes.current_page),
				limit: Number(res.data.sizes.per_page),
				total: Number(res.data.sizes.total),
			});
		} catch (error: unknown) {
			const err = error as ApiError;
			toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
		} finally {
			setLoading(false);
		}
	};

	// Delete size
	const deleteSize = async (id: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa size này?')) {
			try {
				await sizeService.delete(id);
				toast.success('Size đã được xóa');
				fetchSize();
			} catch (error: unknown) {
				const err = error as ApiError;
				toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
			}
		}
	};

	// Create size
	const createSize = async (data: SizeType) => {
		const response = await sizeService.create(data);
		if (response.data.status === 'error') {
			throw { response: { data: response.data } };
		}
		return response;
	};

	// Update size
	const updateSize = async (id: string, data: SizeType) => {
		const response = await sizeService.update(id, data);
		if (response.data.status === 'error') {
			throw { response: { data: response.data } };
		}
		return response;
	};

	useEffect(() => {
		fetchSize();
	}, []);

	useEffect(() => {
		fetchSize();
	}, [pagination.page]);

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(sizeData.map((_, index) => index)); // Select all
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
		setEditingSize(null);
		setIsModalOpen(true);
	};

	// Modify openEditModal to find and set the size data
	const openEditModal = (sizeId: string) => {
		const sizeToEdit = sizeData.find((s) => s.id === sizeId);
		if (sizeToEdit) {
			setEditingSize(sizeId);
			// Reset form with existing values
			reset({
				size: sizeToEdit.size,
			});
			setIsModalOpen(true);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingSize(null);
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

	// Add form handling
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SizeType>({
		resolver: joiResolver(schema),
		defaultValues: {
			size: '',
		},
	});

	// Add submit handler
	const onSubmit = async (data: SizeType) => {
		try {
			toast.loading(`${editingSize ? 'Updating' : 'Adding'} size`);
			if (editingSize) {
				await updateSize(editingSize, data);
			} else {
				await createSize(data);
			}
			toast.dismiss();
			toast.success(`${editingSize ? 'Update' : 'Add'} size successfully`);
			await fetchSize(); // Refresh the list
			reset(); // Reset form
			setIsModalOpen(false); // Chỉ đóng modal khi thành công
		} catch (error: unknown) {
			const err = error as ApiError;
			toast.dismiss(); // Dismiss loading toastS
			if (err.response?.data?.message === 'The size has already been taken.') {
				toast.error('This size already exists');
				// Không đóng modal và giữ dữ liệu để người dùng có thể sửa
			} else {
				toast.error(err.response?.data?.message || 'Something went wrong');
			}
		}
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({
			...prev,
			page,
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

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Danh sách size
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
						Thêm size
					</button>
				</div>
			</div>

			<div className="relative overflow-x-auto border border-stroke h-full">
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 z-0">
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
							<th scope="col" className="px-6 py-3 w-2/3">
								size
							</th>
							<th scope="col" className="px-6 py-3 w-1/3">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="h-full">
						{loading ? (
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
						) : (
							sizeData.map((size, key) => (
								<tr
									className={`bg-white dark:bg-slate-800 ${key !== sizeData.length - 1
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
									<td className="px-6 py-3">{size.size}</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
											onClick={() => openEditModal(size.id!)}
										>
											<PencilLine size={16} />
										</button>
										<button
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
											onClick={() => deleteSize(size.id!)}
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

			<div className="join ms-auto mt-auto">{renderPaginationButtons()}</div>

			{/* Thêm/Sửa size Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
					<div
						ref={modalRef}
						className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/3"
					>
						<h2 className="text-xl font-semibold mb-4">
							{editingSize ? 'Sửa size' : 'Thêm size'}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)}>
							<input
								type="text"
								className="w-full p-2 border rounded mb-2"
								placeholder="Tên size"
								{...register('size')}
							/>
							{errors.size && (
								<p className="text-red-500 text-sm mb-4">
									{errors.size.message}
								</p>
							)}

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
									{editingSize ? 'Lưu Thay Đổi' : 'Thêm size'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Size;
