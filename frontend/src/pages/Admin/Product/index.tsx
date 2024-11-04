import { Eye, PencilLine } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { formatVNCurrency } from '../../../common/formatVNCurrency';
import productService, { PRODUCT } from '../../../services/admin/product';
import LoadingTable from '../LoadingTable';
import ModalProduct from './ModalProduct';
import { toast } from 'react-hot-toast';
import { CATEGORY } from '../../../services/admin/category';
import categoryService from '../../../services/admin/category';
import sizeService, { SIZE } from '../../../services/admin/size';
import brandService, { BRAND } from '../../../services/admin/brand';

export enum Status {
	PUBLIC = 'public',
	UNPUBLIC = 'unpublic',
	HIDDEN = 'hidden',
}

const Product = () => {
	const [selectAll, setSelectAll] = useState(false); // State for select all
	const [selectedItems, setSelectedItems] = useState<number[]>([]); // State for individual selections
	const [productData, setProductData] = useState<PRODUCT[]>([]);
	const [categories, setCategories] = useState<CATEGORY[]>([]);
	const [sizes, setSizes] = useState<SIZE[]>([]);
	const [brands, setBrands] = useState<BRAND[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [totalPages, setTotalPages] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<PRODUCT | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	const fetchProducts = async () => {
		try {
			const res = await productService.getAll(page, limit);
			setProductData(res.data.data.data);
			setTotalPages(res.data.data.last_page);
		} catch (error) {
			console.error(error);
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
		(async () => {
			try {
				const categories = await categoryService.getAll();
				const sizes = await sizeService.getAll();
				const brands = await brandService.getAll();

				setCategories(categories.data.category.data);
				setSizes(sizes.data.sizes.data);
				setBrands(brands.data.brands.data);
			} catch (error) {
				console.error(error);
			}
		})();
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [page, limit]);

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

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const renderPaginationButtons = () => {
		const buttons = [];
		const maxVisibleButtons = 5;

		// Always show first page
		buttons.push(
			<button
				key={1}
				onClick={() => handlePageChange(1)}
				className={`join-item btn btn-sm ${page === 1 ? 'btn-active' : ''}`}
			>
				1
			</button>
		);

		if (totalPages <= maxVisibleButtons) {
			// Show all pages if total is small
			for (let i = 2; i <= totalPages; i++) {
				buttons.push(
					<button
						key={i}
						onClick={() => handlePageChange(i)}
						className={`join-item btn btn-sm ${
							page === i ? 'btn-active' : ''
						}`}
					>
						{i}
					</button>
				);
			}
		} else {
			// Show dots and last few pages
			if (page > 3) {
				buttons.push(
					<button
						key="dots1"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Show current page and neighbors
			for (
				let i = Math.max(2, page - 1);
				i <= Math.min(page + 1, totalPages - 1);
				i++
			) {
				buttons.push(
					<button
						key={i}
						onClick={() => handlePageChange(i)}
						className={`join-item btn btn-sm ${
							page === i ? 'btn-active' : ''
						}`}
					>
						{i}
					</button>
				);
			}

			if (page < totalPages - 2) {
				buttons.push(
					<button
						key="dots2"
						className="join-item btn btn-sm btn-disabled"
					>
						...
					</button>
				);
			}

			// Always show last page
			buttons.push(
				<button
					key={totalPages}
					onClick={() => handlePageChange(totalPages)}
					className={`join-item btn btn-sm ${
						page === totalPages ? 'btn-active' : ''
					}`}
				>
					{totalPages}
				</button>
			);
		}

		return <div className="join ms-auto">{buttons}</div>;
	};

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);
	const handleSuccess = () => {
		fetchProducts(); // Refresh product list after successful creation
		closeModal();
	};

	const openEditModal = async (product: PRODUCT) => {
		setSelectedProduct(product);
		setIsEditModalOpen(true);
	};

	const closeEditModal = () => {
		setIsEditModalOpen(false);
		setSelectedProduct(null);
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
					<button
						onClick={openModal}
						className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
					>
						<Plus size={16} />
						Add Product
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
								<div className="flex items-center">
									Sale Price
									<a>
										<FaSort />
									</a>
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
									Category
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
							productData.map((product, key) => (
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
										{product.categories?.map((category) => (
											<p key={category.id}>{category.name}</p>
										))}
									</td>
									<td className="px-6 py-3">
										<div
											className={`badge text-white badge-${
												product.status === Status.PUBLIC
													? 'success'
													: product.status === Status.UNPUBLIC
													? 'warning'
													: 'error'
											}`}
										>
											{product.status}
										</div>
									</td>
									<td className="px-6 py-3 flex items-center gap-2">
										<button className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary">
											<Eye size={16} />
										</button>
										<button
											onClick={() => openEditModal(product)}
											className="btn btn-sm bg-[#BCDDFE] hover:bg-[#BCDDFE]/80 text-primary"
										>
											<PencilLine size={16} />
										</button>
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

			{renderPaginationButtons()}

			<ModalProduct
				categories={categories}
				sizes={sizes}
				brands={brands}
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				onSuccess={() => {
					fetchProducts();
					closeEditModal();
				}}
				product={selectedProduct}
			/>

			<ModalProduct
				categories={categories}
				sizes={sizes}
				brands={brands}
				isOpen={isModalOpen}
				onClose={closeModal}
				onSuccess={handleSuccess}
			/>
		</div>
	);
};

export default Product;
