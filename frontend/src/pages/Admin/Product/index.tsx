import { PencilLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { formatVNCurrency } from '../../../common/formatVNCurrency';

const Product = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections

	const productData = [
		{
			name: 'Product 1',
			price: 100000,
			category: 'Category 1',
			status: 'Active',
			image: 'https://placehold.co/100x100',
			rating: 4.5,
			reviews: 100,
			size: [38, 39, 40, 41, 42, 43],
		},
		{
			name: 'Product 2',
			price: 150000,
			category: 'Category 2',
			status: 'Active',
			image: 'https://placehold.co/100x100',
			rating: 4.0,
			reviews: 80,
			size: [39, 40, 41],
		},
		{
			name: 'Product 3',
			price: 200000,
			category: 'Category 3',
			status: 'Inactive',
			image: 'https://placehold.co/100x100',
			rating: 3.5,
			reviews: 50,
			size: [40, 41, 42],
		},
		{
			name: 'Product 4',
			price: 250000,
			category: 'Category 1',
			status: 'Active',
			image: 'https://placehold.co/100x100',
			rating: 5.0,
			reviews: 200,
			size: [38, 39, 40, 41],
		},
		{
			name: 'Product 5',
			price: 300000,
			category: 'Category 2',
			status: 'Active',
			image: 'https://placehold.co/100x100',
			rating: 4.8,
			reviews: 150,
			size: [39, 40, 41, 42],
		},
	];

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(productData.map((_, index) => index)); // Select all
		}
		setSelectAll(!selectAll); // Toggle select all state
	};

	const handleSelectItem = (index: number) => {
		if (selectedItems.includes(index)) {
			setSelectedItems(selectedItems.filter((item: any) => item !== index)); // Deselect item
		} else {
			setSelectedItems([...selectedItems, index]); // Select item
		}
	};

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Product List
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
					<Link
						to="/admin/product/create"
						className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
					>
						<Plus size={16} />
						Add Product
					</Link>
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
										checked={selectAll} // Bind checked state
										onChange={handleSelectAll} // Add onChange handler
									/>
									<label
										htmlFor="checkbox-all-search"
										className="sr-only"
									>
										checkbox
									</label>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Name
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Price
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								Category
							</th>
							<th scope="col" className="px-6 py-3">
								Status
							</th>
							<th scope="col" className="px-6 py-3">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{productData.map((product, key) => (
							<tr
								className={`bg-white dark:bg-slate-800 ${
									key !== productData.length - 1
										? 'border-b border-stroke'
										: ''
								}`}
								key={key}
							>
								<td className="w-4 p-4">
									<div className="flex items-center">
										<input
											id={`checkbox-table-search-${key}`} // Unique ID for each checkbox
											type="checkbox"
											className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
											checked={selectedItems.includes(key)} // Bind checked state to individual selection
											onChange={() => handleSelectItem(key)} // Add onChange handler for individual checkboxes
										/>
										<label
											htmlFor={`checkbox-table-search-${key}`}
											className="sr-only"
										>
											checkbox
										</label>
									</div>
								</td>
								<td className="px-6 py-3">{product.name}</td>
								<td className="px-6 py-3">
									{formatVNCurrency(product.price)}
								</td>
								<td className="px-6 py-3">{product.category}</td>
								<td className="px-6 py-3">
									<div
										className={`badge text-white badge-${
											product.status === 'Active'
												? 'success'
												: 'error'
										}`}
									>
										{product.status}
									</div>
								</td>
								<td className="px-6 py-3 flex items-center gap-2">
									<button
										onClick={() => {
											const modal = document.getElementById(
												'modal-product'
											) as HTMLDialogElement; // Assert type
											modal?.showModal(); // Now showModal is recognized
										}}
										className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
									>
										<PencilLine size={16} />
									</button>
									<button className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error">
										<Trash2 size={16} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="join ms-auto">
				<button className="join-item btn btn-sm">1</button>
				<button className="join-item btn btn-sm">2</button>
				<button className="join-item btn btn-sm btn-disabled">...</button>
				<button className="join-item btn btn-sm">99</button>
				<button className="join-item btn btn-sm">100</button>
			</div>
		</div>
	);
};

export default Product;
