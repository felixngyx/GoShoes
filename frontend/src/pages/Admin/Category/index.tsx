import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { FaSort } from 'react-icons/fa';
import { useState } from 'react'; // Add this import

const Category = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections

	const categoryData = [
		{
			name: 'Category 1',
			slug: 'category-1',
			description: 'Description 1',
		},
		{
			name: 'Category 2',
			slug: 'category-2',
			description: 'Description 2',
		},
		{
			name: 'Category 3',
			slug: 'category-3',
			description: 'Description 3',
		},
		{
			name: 'Category 4',
			slug: 'category-4',
			description: 'Description 4',
		},
		{
			name: 'Category 5',
			slug: 'category-5',
			description: 'Description 5',
		},
	];

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(categoryData.map((_, index) => index)); // Select all
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

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Category List
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
					<button className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary">
						<Plus size={16} />
						Add Category
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
								Name
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Slug
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3 w-1/2">
								Description
							</th>
							<th scope="col" className="px-6 py-3">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{categoryData.map((category, key) => (
							<tr
								className={`bg-white dark:bg-slate-800 ${
									key !== categoryData.length - 1
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
								<td className="px-6 py-3">{category.name}</td>
								<td className="px-6 py-3">{category.slug}</td>
								<td className="px-6 py-3">
									Lorem ipsum dolor sit amet consectetur adipisicing
									elit. Voluptatum voluptatibus quas excepturi ipsam
									iste quam!
								</td>
								<td className="px-6 py-3 flex items-center gap-2">
									<button className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary">
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

export default Category;
