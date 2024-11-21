import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BRAND } from '../../../services/admin/brand';
import brandService from '../../../services/admin/brand';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';
import LoadingIcon from '../../../components/common/LoadingIcon';

// Update schema validation
const schema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Brand name is required',
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

	const fetchBrands = async () => {
		try {
			setLoading(true);
			const res = await brandService.getAll(
				pagination.page,
				Number(pagination.limit) // Ensure limit is a number
			);
			setBrands(res.data.brands.data);
			setPagination({
				page: Number(res.data.brands.current_page),
				limit: Number(res.data.brands.per_page),
				total: Number(res.data.brands.total),
			});
		} catch (error) {
			console.log(error);
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
				className={`join-item btn btn-sm ${
					pagination.page === 1 ? 'btn-active bg-primary text-white' : ''
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
							className={`join-item btn btn-sm ${
								pagination.page === i
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
					className={`join-item btn btn-sm ${
						pagination.page === totalPages
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
		// Reset form with existing values
		reset({
			name: brand.name,
		});
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
	} = useForm<BRAND>({
		resolver: joiResolver(schema),
		defaultValues: {
			name: '',
		},
	});

	const onSubmit = async (data: BRAND) => {
		try {
			if (editingBrand) {
				// Handle edit
				await brandService.update(editingBrand.id!, data);
				toast.success('Brand updated successfully');
			} else {
				// Handle add
				await brandService.create(data);
				toast.success('Brand added successfully');
			}
			await fetchBrands(); // Refresh the list
			closeModal();
			reset(); // Reset form
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Something went wrong');
		}
	};

	// Add useEffect to handle form reset when editingBrand changes
	useEffect(() => {
		if (editingBrand) {
			reset({
				name: editingBrand.name,
			});
		} else {
			reset({
				name: '',
			});
		}
	}, [editingBrand, reset]);

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5 col-span-1">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Brand List
				</h4>
				<div className="flex items-center gap-2">
					<button
						className={`btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error ${
							selectedItems.length > 0
								? 'flex items-center gap-2'
								: 'hidden'
						}`}
					>
						<Trash2 size={16} />
						<p>Delete {selectedItems.length} items</p>
					</button>
					<button
						className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
						onClick={openAddModal}
					>
						<Plus size={16} />
						Add Brand
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
								Name
							</th>
							<th scope="col" className="px-6 py-3 w-1/3">
								Action
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
									className={`bg-white dark:bg-slate-800 ${
										key !== brands.length - 1
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
									<td className="px-6 py-3 flex items-center gap-2">
										<button
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
											onClick={() => openEditModal(brand)}
										>
											<PencilLine size={16} />
										</button>
										<button
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
											onClick={() => deleteBrand(brand.id!)}
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

			{/* Add/Edit Brand Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div
						ref={modalRef}
						className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/3"
					>
						<h2 className="text-xl font-semibold mb-4">
							{editingBrand ? 'Edit Brand' : 'Add Brand'}
						</h2>
						<form onSubmit={handleSubmit(onSubmit)}>
							<input
								type="text"
								className="w-full p-2 border rounded mb-2"
								placeholder="Brand name"
								{...register('name')}
							/>
							{errors.name && (
								<p className="text-red-500 text-sm mb-4">
									{errors.name.message}
								</p>
							)}
							<div className="flex justify-end gap-2">
								<button
									type="button"
									className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
									onClick={closeModal}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
								>
									{editingBrand ? 'Save Changes' : 'Add Brand'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Brand;
