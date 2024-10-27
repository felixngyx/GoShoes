import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BRAND } from '../../../types/admin/brand';
import brandService from '../../../services/admin/brand';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import toast from 'react-hot-toast';

const schema = Joi.object({
	name: Joi.string().required().messages({
		'string.empty': 'Brand name is required',
	}),
});

const Brand = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBrand, setEditingBrand] = useState<BRAND | null>(null);

	const [brands, setBrands] = useState<BRAND[]>([]);

	const fetchBrands = async () => {
		try {
			const res = await brandService.getAll();
			setBrands(res.data.brands.data);
		} catch (error) {
			console.log(error);
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
	}, []);

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
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingBrand(null);
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
	});

	const onSubmit = async (data: { name: string }) => {
		try {
			if (editingBrand) {
				// Handle edit
				await brandService.update(editingBrand.id!, data);
				toast.success('Brand updated successfully');
			} else {
				await brandService.create(data);
				toast.success('Brand added successfully');
				reset();
			}
			closeModal();
			fetchBrands();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'An error occurred');
		}
	};

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

			<div className="relative overflow-x-auto border border-stroke">
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
				</table>
			</div>

			<div className="join ms-auto mt-auto">
				<button className="join-item btn btn-sm">1</button>
				<button className="join-item btn btn-sm">2</button>
				<button className="join-item btn btn-sm btn-disabled">...</button>
				<button className="join-item btn btn-sm">99</button>
				<button className="join-item btn btn-sm">100</button>
			</div>

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
							<label className="form-control w-full mb-4">
								<div className="label">
									<span className="label-text text-gray-500">
										Brand name
									</span>
								</div>
								<input
									type="text"
									className="input-sm w-full p-2 border rounded"
									placeholder="Brand name"
									{...register('name')}
								/>
								{errors.name && (
									<p className="text-red-500 text-sm mb-4">
										{errors.name.message}
									</p>
								)}
							</label>
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
