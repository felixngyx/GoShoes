import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';
import categoryService, { CATEGORY } from '../../../services/admin/category';
import LoadingIcon from '../../../components/common/LoadingIcon';
import generateSlug from '../../../common/generateSlug';
import Swal from 'sweetalert2';

type PaginationType = {
	page: number;
	limit: number;
	total: number;
};

const schema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Category name is required',
	}),
	description: Joi.string().required().messages({
		'string.empty': 'Description is required',
	}),
});

const Category = () => {
	const [selectAll, setSelectAll] = useState(false);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<CATEGORY | null>(
		null
	);
	const [pagination, setPagination] = useState<PaginationType>({
		page: 1,
		limit: 5,
		total: 0,
	});

	const [loading, setLoading] = useState<boolean>(false);
	const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CATEGORY>({
		resolver: joiResolver(schema),
		defaultValues: {
			name: '',
		},
	});

	const fetchCategories = async () => {
		try {
			setIsPageLoading(true);
			const res = await categoryService.getAll(
				pagination.page,
				Number(pagination.limit)
			);
			if (res?.data?.categories) {
				setCategories(res.data.categories.data || []);
				setPagination({
					page: Number(res.data.categories.current_page || 1),
					limit: Number(res.data.categories.per_page || 5),
					total: Number(res.data.categories.total || 0),
				});
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
			toast.error('Không thể tải danh sách danh mục');
		} finally {
			setIsPageLoading(false);
		}
	};

	const deleteCategory = async (id: number) => {
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
					const message = toast.loading('Đang xóa danh mục...');
					await categoryService.delete(Number(id));
					toast.dismiss(message);
					toast.success('Danh mục đã được xóa');
					fetchCategories();
				} catch (error: any) {
					toast.error(error.response?.data?.message || 'Danh mục không thể xóa');
				}
			}
		})

	};

	const onSubmit = async (data: CATEGORY) => {
		try {
			setLoading(true);
			if (editingCategory) {
				data.slug = generateSlug(data.name);
				await categoryService.update(Number(editingCategory.id!), data);
				toast.success('Danh mục đã được cập nhật');
			} else {
				data.slug = generateSlug(data.name);
				await categoryService.create(data);
				toast.success('Danh mục đã được thêm');
			}
			closeModal();
			await fetchCategories();
			reset();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
		} finally {
			setLoading(false);
		}
	};

	const modalRef = useRef<HTMLDivElement>(null);

	const openAddModal = () => {
		setEditingCategory(null);
		setIsModalOpen(true);
	};

	const openEditModal = (category: CATEGORY) => {
		setEditingCategory(category);
		reset({ name: category.name });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingCategory(null);
		reset();
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]);
		} else {
			setSelectedItems(categories.map((_, index) => index));
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

	useEffect(() => {
		fetchCategories();
	}, [pagination.page]);

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
					Danh sách danh mục
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
						Thêm danh mục
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
							<th scope="col" className="px-6 py-3 w-2/3">
								Tên
							</th>
							<th scope="col" className="px-6 py-3 w-1/3">
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className="z-0 h-full">
						{isPageLoading ? (
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
							categories.map((category, key) => (
								<tr
									className={`bg-white dark:bg-slate-800 ${key !== categories.length - 1
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
									<td className="px-6 py-3">{category.name}</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
											onClick={() => openEditModal(category)}
										>
											<PencilLine size={16} />
										</button>
										<button
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
											onClick={() =>
												deleteCategory(Number(category.id!))
											}
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
							{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)}>
							<label className="form-control">
								<div className="label">
									<span className="label-text font-semibold">
										Tên
									</span>
								</div>
								<input
									type="text"
									className="input input-bordered w-full"
									placeholder="Tên danh mục"
									{...register('name')}
								/>
								{errors.name && (
									<small className="text-red-500">
										{errors.name.message}
									</small>
								)}
							</label>
							<label className="form-control mt-4">
								<div className="label">
									<span className="label-text font-semibold">
										Mô tả
									</span>
								</div>
								<textarea
									className="textarea textarea-bordered w-full"
									placeholder="Mô tả"
									{...register('description')}
								></textarea>
								{errors.description && (
									<small className="text-red-500">
										{errors.description.message}
									</small>
								)}
							</label>

							<div className="flex justify-end gap-2 mt-4">
								<button
									type="button"
									className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
									onClick={closeModal}
								>
									Hủy
								</button>
								<button
									disabled={loading}
									type="submit"
									className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
								>
									{loading ? (
										<LoadingIcon
											type="spinner"
											size="sm"
											color="info"
										/>
									) : editingCategory ? (
										'Lưu thay đổi'
									) : (
										'Thêm danh mục'
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Category;
