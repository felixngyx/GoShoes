import { Eye, PencilLine } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import productService, { PRODUCT } from '../../../services/admin/product';
import LoadingTable from '../LoadingTable';
import { toast } from 'react-hot-toast';
import Pagination from '../../../components/admin/Pagination';
import { Link } from 'react-router-dom';
import { formatVNCurrency } from '../../../common/formatVNCurrency';

export enum Status {
	PUBLIC = 'public',
	UNPUBLIC = 'unpublic',
	HIDDEN = 'hidden',
}

type Product = {
	id: number;
	name: string;
	price: number;
	promotional_price: number;
	stock_quantity: number;
	categories: string[];
	status: string;
	thumbnail: string;
	images: string[];
	variants: {
		color: string;
		size: number;
		quantity: number;
		image_variant: string;
	}[];
};

// Thêm interface cho sort
interface SortConfig {
	field: keyof PRODUCT | '';
	direction: 'asc' | 'desc';
}

const Product = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [productData, setProductData] = useState<PRODUCT[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		field: 'id',
		direction: 'desc'
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredData, setFilteredData] = useState<PRODUCT[]>([]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await productService.getAll(currentPage, 10);
			setProductData(res.data.data);
			setTotalPages(res.data.total_pages);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const deleteProduct = async (id: number) => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			try {
				await productService.delete(id);
				toast.success('Product deleted successfully');
				fetchProducts();
			} catch (error) {
				console.error(error);
			}
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [currentPage]);

	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredData(productData);
			return;
		}

		const filtered = productData.filter(product =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
		);
		setFilteredData(filtered);
	}, [searchTerm, productData]);

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

	// Thêm hàm xử lý sort
	const handleSort = (field: keyof PRODUCT) => {
		setSortConfig(prev => ({
			field,
			direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
		}));
	};

	// Thêm hàm để sort data
	const getSortedData = () => {
		if (!sortConfig.field) return productData;

		return [...productData].sort((a, b) => {
			if (sortConfig.field === 'price' || sortConfig.field === 'promotional_price' || sortConfig.field === 'id') {
				const aValue = Number(a[sortConfig.field]);
				const bValue = Number(b[sortConfig.field]);
				return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
			}

			if (a[sortConfig.field] < b[sortConfig.field]) {
				return sortConfig.direction === 'asc' ? -1 : 1;
			}
			if (a[sortConfig.field] > b[sortConfig.field]) {
				return sortConfig.direction === 'asc' ? 1 : -1;
			}
			return 0;
		});
	};

	// Hàm lọc dữ liệu chỉ theo tên
	const getFilteredData = () => {
		if (!searchTerm.trim()) return productData;
		
		const searchLower = searchTerm.toLowerCase().trim();
		return productData.filter(product => 
			product.name.toLowerCase().includes(searchLower)
		);
	};

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-6 px-4 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<div className="flex justify-between items-center">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Product List
				</h4>
				<div className="flex items-center gap-4">
					<input
						type="text"
						placeholder="Search by product name..."
						className="input input-bordered w-full max-w-xs"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
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
								<div 
									className="flex items-center cursor-pointer" 
									onClick={() => handleSort('name')}
								>
									Name
									<FaSort className={`ml-1 ${
										sortConfig.field === 'name' 
											? 'text-primary' 
											: 'text-gray-400'
									}`} />
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div 
									className="flex items-center cursor-pointer" 
									onClick={() => handleSort('price')}
								>
									Price
									<FaSort className={`ml-1 ${
										sortConfig.field === 'price' 
											? 'text-primary' 
											: 'text-gray-400'
									}`} />
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div 
									className="flex items-center cursor-pointer" 
									onClick={() => handleSort('promotional_price')}
								>
									Sale Price
									<FaSort className={`ml-1 ${
										sortConfig.field === 'promotional_price' 
											? 'text-primary' 
											: 'text-gray-400'
									}`} />
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Quantity
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								<div className="flex items-center">
									Status
									<a>
										<FaSort />
									</a>
								</div>
							</th>
							<th scope="col" className="px-6 py-3">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<LoadingTable />
						) : (
							getSortedData().map((product, key) => (
								<tr
									className={`bg-white dark:bg-slate-800 ${
										key !== getSortedData().length - 1
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
									<td className="px-6 py-3">
										<div className="flex items-center gap-2">
											<img
												src={product.thumbnail as string}
												alt={product.name}
												className="size-10 rounded-full"
											/>
											<p className="font-semibold">{product.name}</p>
										</div>
									</td>
									<td className="px-6 py-3 font-semibold">
										{formatVNCurrency(Number(product.price))}
									</td>
									<td className="px-6 py-3 font-semibold">
										{formatVNCurrency(
											Number(product.promotional_price)
										)}
									</td>
									<td className="px-6 py-3">
										{product.stock_quantity}
									</td>
									<td className="px-6 py-3">
										<div
											className={`badge text-white bg-${
												product.status === Status.PUBLIC
													? 'success'
													: product.status === Status.UNPUBLIC
													? 'warning'
													: 'red-500'
											}`}
										>
											{product.status}
										</div>
									</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary">
											<Eye size={16} />
										</button>
										<Link
											to={`/admin/product/update/${product.id}`}
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
										>
											<PencilLine size={16} />
										</Link>
										<button
											onClick={() =>
												deleteProduct(Number(product.id))
											}
											className="btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
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

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
			/>
		</div>
	);
};

export default Product;
