import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { FaBars, FaSearch, FaTh } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { getProductByBrandId } from '../../../services/client/product';
import ProductItems from '../ProductList/ProductItem';
import ProductCardList from '../ProductList/ProductCardList';
import { getAllBrands } from '../../../services/client/brand';
import Pagination from '../ProductList/Pagination';

const ProductListBrand = () => {
	const [layout, setLayout] = useState<'grid' | 'list'>('grid');
	const [searchTerm, setSearchTerm] = useState('');
	const [sortType, setSortType] = useState('');
	const [perPage, setPerPage] = useState(9);
	const [page, setPage] = useState(1);
	// state cho giá tối đa
	const { id } = useParams<{ id: string }>();

	const {
		data: response = {},
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['PRODUCT_BRAND_ID', id],
		queryFn: async () => await getProductByBrandId(Number(id), page, perPage),
	});

	const products = response.data || [];

	const { data: brandsData = [] } = useQuery({
		queryKey: ['BRANDS_KEY'],
		queryFn: () => getAllBrands(100, 1),
	});

	const brands = Array.isArray(brandsData?.brands) ? brandsData.brands : [];

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSortType(e.target.value);
	};

	const handleShowCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setPerPage(Number(e.target.value));
	};

	// Filter products based on searchTerm and price range
	const filterProduct = products.filter((item: any) =>
		item?.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Sort filtered products based on sortType
	const sortedProducts = filterProduct.sort((a: any, b: any) => {
		if (sortType === 'Tên (A-Z)') return a.name.localeCompare(b.name);
		if (sortType === 'Tên (Z-A)') return b.name.localeCompare(a.name);
		if (sortType === 'Đánh giá (High to Low)')
			return b.rating_count - a.rating_count;
		if (sortType === 'Đánh giá (Low to High)')
			return a.rating_count - b.rating_count;
		if (sortType === 'Giá (Low to High)')
			return a.promotional_price - b.promotional_price;
		if (sortType === 'Giá (High to Low)')
			return b.promotional_price - a.promotional_price;
		return 0;
	});
	const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const dropdownRef = useRef(null);

	// Hàm xử lý khi chọn một brand
	const handleSelectBrand = (brandId: number) => {
		setSelectedBrand(brandId);
		setIsOpen(false); // Đóng dropdown sau khi chọn
	};

	// Hàm mở/đóng dropdown khi nhấp vào label
	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	// Đóng dropdown khi người dùng nhấp ra ngoài
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!(dropdownRef.current as any).contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);
	const totalPages = response?.total_pages || 1;

	useEffect(() => {
		refetch();
	}, [searchTerm, sortType, perPage, page, selectedBrand]);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Danh sách thương hiệu - Phần mới */}
			<div className="relative mb-4" ref={dropdownRef}>
				{/* Tiêu đề Button */}
				<label
					tabIndex={0}
					className="btn w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-6 py-3 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md focus:outline-none flex items-center justify-between"
					onClick={toggleDropdown} // Mở/đóng dropdown khi nhấp vào label
				>
					<span className="text-lg font-medium">
						{selectedBrand
							? `Đã chọn: ${brands.find((b: any) => b.id === selectedBrand)?.name
							}`
							: 'Chọn thương hiệu'}
					</span>
					{/* Biểu tượng mũi tên chỉ xuống */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						className="w-5 h-5 text-white ml-2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</label>

				{/* Dropdown Menu */}
				{isOpen && (
					<ul
						tabIndex={0}
						className="absolute right-0 mt-2 w-full bg-white shadow-lg rounded-xl border border-gray-300 z-50 max-h-60 overflow-y-auto"
					>
						{brands.map((item: any) => (
							<li key={item.id}>
								<Link
									to={`/brand/${item.id}`}
									onClick={() => handleSelectBrand(item.id)} // Chọn brand và đóng dropdown
									className={`block p-4 text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 ease-in-out ${selectedBrand === item.id
											? 'bg-blue-100 text-blue-600'
											: ''
										}`}
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Bộ lọc */}
			<div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-4 lg:space-y-0">
				<div className="flex items-center space-x-4">
					<span>{sortedProducts.length} Sản phẩm</span>
					<select
						className="select select-bordered bg-white text-gray-800"
						value={sortType}
						onChange={handleSort}
					>
						<option disabled value="">
							Sắp xếp theo
						</option>
						<option>Tên (A-Z)</option>
						<option>Tên (Z-A)</option>
						<option>Đánh giá (Cao đến Thấp)</option>
						<option>Đánh giá (Thấp đến Cao)</option>
						<option>Giá (Thấp đến Cao)</option>{' '}
						{/* Thêm sắp xếp theo giá tăng dần */}
						<option>Giá (Cao đến Thấp)</option>{' '}
						{/* Thêm sắp xếp theo giá giảm dần */}
					</select>
					<select
						className="select select-bordered bg-white text-gray-800"
						value={perPage}
						onChange={handleShowCountChange}
					>
						<option value={9}>Hiển thị 9</option>
						<option value={15}>Hiển thị 15</option>
					</select>
				</div>

				{/* Thanh tìm kiếm */}
				<div className="w-180 flex justify-center mb-8 px-4">
					<div className="form-control w-full max-w-5xl">
						<div className="input-group flex items-center w-full bg-gray-100 rounded-full px-6 py-3">
							<input
								type="text"
								placeholder="Tìm kiếm thương hiệu..."
								className="input input-bordered w-full bg-transparent border-none text-black focus:outline-none focus:ring-0"
								value={searchTerm}
								onChange={handleSearch}
							/>
							<button className="btn bg-transparent hover:bg-[#3389cc] text-[#40BFFF] border-none">
								<FaSearch />
							</button>
						</div>
					</div>
				</div>

				<div className="items-center space-x-2 ml-auto">
					{/* Nút bố cục lưới */}
					<button
						className={`btn btn-square ${layout === 'grid'
								? 'bg-[#40BFFF] text-white'
								: 'bg-white text-gray-800 border border-gray-300'
							}`}
						onClick={() => setLayout('grid')}
					>
						<FaTh />
					</button>

					{/* Nút bố cục danh sách */}
					<button
						className={`btn btn-square ${layout === 'list'
								? 'bg-[#40BFFF] text-white'
								: 'bg-white text-gray-800 border border-gray-300'
							}`}
						onClick={() => setLayout('list')}
					>
						<FaBars />
					</button>
				</div>
			</div>

			{/* Danh sách sản phẩm */}
			<div
				className={`grid ${layout === 'grid' ? 'grid-cols-3' : 'grid-cols-1'
					} gap-5`}
			>
				{isLoading ? (
					<>
						{Array(sortedProducts.length || 9) // Hoặc một giá trị cố định nếu muốn
							.fill(null)
							.map((_, index) =>
								layout === 'grid' ? (
									<ProductItems
										key={index}
										product={null}
										isLoading={true}
									/>
								) : (
									<ProductCardList
										key={index}
										product={null}
										isLoading={true}
									/>
								)
							)}
					</>
				) : sortedProducts.length > 0 ? (
					sortedProducts.map((product: any) =>
						layout === 'grid' ? (
							<ProductItems
								key={product.id}
								product={product}
								isLoading={false}
							/>
						) : (
							<ProductCardList
								key={product.id}
								product={product}
								isLoading={false}
							/>
						)
					)
				) : (
					<div className="col-span-full text-center">
						<p>Không có sản phẩm nào</p>
					</div>
				)}
			</div>

			{/* Phân trang */}
			<Pagination
				currentPage={page}
				totalPages={totalPages}
				onPageChange={(newPage: number) => {
					setPage(newPage);
					refetch();
				}}
			/>
		</div>
	);
};

export default ProductListBrand;
