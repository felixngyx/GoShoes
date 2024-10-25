import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Color = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingColor, setEditingColor] = useState<string | null>(null);
	const [colorName, setColorName] = useState('');
	const [hexCode, setHexCode] = useState('#000000');

	const colorData = [
		{
			id: '1',
			color: 'Red',
			hex_code: '#FF0000',
			createdAt: '2021-01-01',
			updatedAt: '2021-01-01',
		},
		{
			id: '2',
			color: 'Blue',
			hex_code: '#0000FF',
			createdAt: '2021-01-02',
			updatedAt: '2021-01-02',
		},
		{
			id: '3',
			color: 'Green',
			hex_code: '#00FF00',
			createdAt: '2021-01-03',
			updatedAt: '2021-01-03',
		},
		{
			id: '4',
			color: 'Yellow',
			hex_code: '#FFFF00',
			createdAt: '2021-01-04',
			updatedAt: '2021-01-04',
		},
		{
			id: '5',
			color: 'Purple',
			hex_code: '#800080',
			createdAt: '2021-01-05',
			updatedAt: '2021-01-05',
		},
	];

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(colorData.map((_, index) => index)); // Select all
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
		setEditingColor(null);
		setColorName('');
		setHexCode('#000000');
		setIsModalOpen(true);
	};

	const openEditModal = (color: string, hex: string) => {
		setEditingColor(color);
		setColorName(color);
		setHexCode(hex);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingColor(null);
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

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5 col-span-1">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Color List
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
								Color
							</th>
							<th scope="col" className="px-6 py-3 w-1/3">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{colorData.map((color, key) => (
							<tr
								className={`bg-white dark:bg-slate-800 ${
									key !== colorData.length - 1
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
								<td className="px-6 py-3">{color.color}</td>
								<td className="px-6 py-3">
									<div
										className="w-10 h-10 rounded-full"
										style={{ backgroundColor: color.hex_code }}
									></div>
								</td>
								<td className="px-6 py-3 flex items-center gap-2">
									<button
										className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
										onClick={() =>
											openEditModal(color.color, color.hex_code)
										}
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

			{/* Add/Edit Color Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
					<div
						ref={modalRef}
						className="bg-white dark:bg-boxdark p-6 rounded-lg w-1/3"
					>
						<h2 className="text-xl font-semibold mb-4">
							{editingColor ? 'Edit Color' : 'Add Color'}
						</h2>
						<input
							type="text"
							className="w-full p-2 border rounded mb-4"
							placeholder="Color name"
							value={colorName}
							onChange={(e) => setColorName(e.target.value)}
						/>
						<div className="flex items-center gap-4 mb-4">
							<input
								type="color"
								className="w-12 h-12 rounded cursor-pointer"
								value={hexCode}
								onChange={(e) => setHexCode(e.target.value)}
							/>
							<input
								type="text"
								className="flex-grow p-2 border rounded"
								placeholder="Hex code"
								value={hexCode}
								onChange={(e) => setHexCode(e.target.value)}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<button
								className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800"
								onClick={closeModal}
							>
								Cancel
							</button>
							<button className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white">
								{editingColor ? 'Save Changes' : 'Add Color'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Color;
