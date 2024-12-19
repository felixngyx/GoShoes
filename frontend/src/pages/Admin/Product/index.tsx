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
import { Search } from 'lucide-react';
import Swal from 'sweetalert2';

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
	const [sortConfig, setSortConfig] = useState<SortConfig>({
		field: 'id',
		direction: 'desc',
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [allProducts, setAllProducts] = useState<PRODUCT[]>([]);
	const itemsPerPage = 10;

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const res = await productService.getAll(currentPage, 10);
			setProductData(res.data.data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const deleteProduct = async (id: number) => {
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
				const message = toast.loading('Deleting product...');
				try {
					await productService.delete(id);
					toast.dismiss(message);
					toast.success('Product deleted successfully');
					fetchAllProducts();
					fetchProducts();
				} catch (error) {
					console.error('Failed to delete product:', error);
				}
			}
		})
	};

	const handleDeleteSelected = async () => {
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
				const message = toast.loading('Deleting products...');
				try {
					await Promise.all(
						selectedItems.map((item) =>
							productService.delete(Number(item))
						)
					);
					toast.dismiss(message);
					toast.success('Products deleted successfully');
					fetchAllProducts();
					fetchProducts();
					setSelectedItems([]);
					setSelectAll(false);
				} catch (error) {
					console.error(error);
				}
			}
		})
	}

	useEffect(() => {
		fetchProducts();
	}, [currentPage]);

	const handleSelectAll = () => {
		if (selectAll) {
			setSelectedItems([]); // Deselect all if already selected
		} else {
			setSelectedItems(productData.map((product) => product.id!)); // Select all
		}
		setSelectAll(!selectAll); // Toggle select all state
	};

	const handleSelectItem = (index: number) => {
		if (selectedItems.includes(index)) {
			setSelectedItems(
				selectedItems.filter((item: number) => item !== index)
			);
		} else {
			setSelectedItems([...selectedItems, index]);
		}
	};

	// Sửa lại hàm handleSort để chỉ xử lý sort khi click
	const handleSort = (field: keyof PRODUCT) => {
		const newDirection =
			sortConfig.field === field && sortConfig.direction === 'asc'
				? 'desc'
				: 'asc';

		// Sort trên toàn bộ dữ liệu thay vì chỉ trang hiện tại
		const newProducts = [...allProducts].sort((a, b) => {
			const direction = newDirection === 'asc' ? 1 : -1;

			switch (field) {
				case 'name':
					return direction * (a.name || '').localeCompare(b.name || '');
				case 'price':
					return direction * (Number(a.price) - Number(b.price));
				case 'promotional_price':
					return (
						direction *
						(Number(a.promotional_price) - Number(b.promotional_price))
					);
				case 'stock_quantity':
					return (
						direction *
						(Number(a.stock_quantity) - Number(b.stock_quantity))
					);
				case 'status':
					return (
						direction * (a.status || '').localeCompare(b.status || '')
					);
				default:
					return 0;
			}
		});

		setAllProducts(newProducts);
		setSortConfig({ field, direction: newDirection });
	};

	// Cập nhật lại hàm search để giữ nguyên thứ tự sort
	const handleSearch = (searchValue: string) => {
		setSearchTerm(searchValue);
		setCurrentPage(1);
	};

	// Fetch tất cả sản phẩm
	const fetchAllProducts = async () => {
		try {
			setLoading(true);
			const res = await productService.getAll(1, 1000); // Lấy nhiều sản phẩm
			const sortedProducts = res.data.data.sort(
				(a: PRODUCT, b: PRODUCT) =>
					new Date(b.created_at || 0).getTime() -
					new Date(a.created_at || 0).getTime()
			);
			setAllProducts(sortedProducts);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllProducts();
	}, []);

	// Lọc sản phẩm theo search term
	const filteredProducts = searchTerm
		? allProducts.filter((product) => {
			const searchLower = searchTerm.toLowerCase();
			const nameMatch = product.name.toLowerCase().includes(searchLower);

			// Sử dụng category_ids thay vì categories
			const categories = Array.isArray(product.category_ids)
				? product.category_ids
				: [];
			const categoryMatch = categories.some((cat) =>
				String(cat).toLowerCase().includes(searchLower)
			);

			return nameMatch || categoryMatch;
		})
		: allProducts;

	// Tính toán sản phẩm cho trang hiện tại
	const paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	return (
		<div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-4 px-2 md:py-6 md:px-6 xl:px-7.5 flex flex-col gap-5">
			<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
				<h4 className="text-xl font-semibold text-black dark:text-white">
					Danh sách sản phẩm ({filteredProducts.length} sản phẩm)
				</h4>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
					<label className="input input-sm w-80 input-bordered flex items-center gap-2">
						<input
							type="text"
							className="grow"
							placeholder="Tìm kiếm theo tên hoặc danh mục..."
							value={searchTerm}
							onChange={(e) => handleSearch(e.target.value)} />
						<Search
							size={20}
						/>
					</label>

					<div className="flex items-center gap-2">
						<button
							onClick={handleDeleteSelected}
							className={`btn btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error whitespace-nowrap ${selectedItems.length > 0
								? 'flex items-center gap-2'
								: 'hidden'
								}`}
						>
							<Trash2 size={16} />
							<span className="hidden sm:inline">Xóa</span>
							{selectedItems.length > 0 && (
								<span>({selectedItems.length})</span>
							)}
						</button>

						<Link
							to="/admin/product/create"
							className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary whitespace-nowrap"
						>
							<Plus size={16} />
							<span className="hidden sm:inline">Thêm sản phẩm</span>
						</Link>
					</div>
				</div>
			</div>

			<div className="relative overflow-x-auto border border-stroke">
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
						<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
							<tr>
								<th scope="col" className="p-4 whitespace-nowrap">
									<div className="flex items-center">
										<input
											type="checkbox"
											className="w-4 h-4"
											checked={selectAll}
											onChange={handleSelectAll}
										/>
									</div>
								</th>
								<th scope="col" className="px-4 py-3 whitespace-nowrap">
									<div
										className="flex items-center cursor-pointer"
										onClick={() => handleSort('name')}
									>
										Tên
										<FaSort
											className={`ml-1 ${sortConfig.field === 'name'
												? 'text-primary'
												: 'text-gray-400'
												}`}
										/>
									</div>
								</th>
								<th
									scope="col"
									className="px-4 py-3 whitespace-nowrap hidden sm:table-cell"
								>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => handleSort('price')}
									>
										Giá
										<FaSort
											className={`ml-1 ${sortConfig.field === 'price'
												? 'text-primary'
												: 'text-gray-400'
												}`}
										/>
									</div>
								</th>
								<th
									scope="col"
									className="px-4 py-3 whitespace-nowrap hidden md:table-cell"
								>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => handleSort('promotional_price')}
									>
										Giá khuyến mãi
										<FaSort
											className={`ml-1 ${sortConfig.field === 'promotional_price'
												? 'text-primary'
												: 'text-gray-400'
												}`}
										/>
									</div>
								</th>
								<th
									scope="col"
									className="px-4 py-3 whitespace-nowrap hidden lg:table-cell"
								>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => handleSort('stock_quantity')}
									>
										Số lượng
										<FaSort
											className={`ml-1 ${sortConfig.field === 'stock_quantity'
												? 'text-primary'
												: 'text-gray-400'
												}`}
										/>
									</div>
								</th>
								<th
									scope="col"
									className="px-4 py-3 whitespace-nowrap hidden sm:table-cell"
								>
									<div
										className="flex items-center cursor-pointer"
										onClick={() => handleSort('status')}
									>
										Trạng thái
										<FaSort
											className={`ml-1 ${sortConfig.field === 'status'
												? 'text-primary'
												: 'text-gray-400'
												}`}
										/>
									</div>
								</th>
								<th scope="col" className="px-4 py-3 whitespace-nowrap">
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<LoadingTable />
							) : paginatedProducts.length === 0 ? (
								<tr>
									<td colSpan={7} className="text-center py-4">
										Không tìm thấy sản phẩm nào
									</td>
								</tr>
							) : (
								paginatedProducts.map((product) => (
									<tr
										key={product.id}
										className="border-b border-stroke hover:bg-gray-50"
									>
										<td className="p-4">
											<input
												type="checkbox"
												className="w-4 h-4"
												checked={selectedItems.includes(product.id!)}
												onChange={() => handleSelectItem(product.id!)}
											/>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<img
													src={product.thumbnail as string}
													alt={product.name}
													className="size-8 sm:size-10 rounded-full"
												/>
												<p className="font-semibold line-clamp-1">
													{product.name}
												</p>
											</div>
										</td>
										<td className="px-4 py-3 hidden sm:table-cell">
											{formatVNCurrency(Number(product.price))}
										</td>
										<td className="px-4 py-3 hidden md:table-cell">
											{product.promotional_price
												? formatVNCurrency(Number(product.promotional_price))
												: 'Không có'}
										</td>
										<td className="px-4 py-3 hidden lg:table-cell">
											{product.stock_quantity}
										</td>
										<td className="px-4 py-3 hidden sm:table-cell">
											<div
												className={`badge text-white bg-${product.status === Status.PUBLIC
													? 'success'
													: product.status === Status.UNPUBLIC
														? 'warning'
														: 'red-500'
													}`}
											>
												{product.status}
											</div>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1 sm:gap-2">
												<Link
													to={`/admin/product/${product.id}`}
													className="btn btn-xs sm:btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
												>
													<Eye size={14} />
												</Link>
												<Link
													to={`/admin/product/update/${product.id}`}
													className="btn btn-xs sm:btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
												>
													<PencilLine size={14} />
												</Link>
												<button
													onClick={() =>
														deleteProduct(Number(product.id))
													}
													className="btn btn-xs sm:btn-sm bg-[#FFD1D1] hover:bg-[#FFD1D1]/80 text-error"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div className="mt-4">
				<Pagination
					currentPage={currentPage}
					totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
					onPageChange={setCurrentPage}
				/>
			</div>
		</div>
	);
};

export default Product;
