import Cookies from 'js-cookie';
import { LogIn, LogOut, Menu, SquarePen, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { MdDashboard, MdOutlineShoppingCart } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getProductsByName } from '../../../services/client/product';
import { logout, setUser } from '../../../store/client/userSlice';
import { RootState } from '../../../store/index';
import { IProduct } from '../../../types/client/products/products';
import { IoCart, IoHeartOutline } from 'react-icons/io5';
import useCart from '../../../hooks/client/useCart';
import { formatVNCurrency } from '../../../common/formatVNCurrency';
import useWishlist from '../../../hooks/client/useWhishList';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

const useDebounce = (value: string, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);
	return debouncedValue;
};

const menuItems = [
	{ "TRANG CHỦ": "/" },
	{ "THƯƠNG HIỆU": "/brand" },
	{ "DANH MỤC": "/category" },
	{ "GIỚI THIỆU": "/about-us" },
	{ "TIN TỨC": "/news" },
	{ "LIÊN HỆ": "/contact" },
];

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [products, setProducts] = useState<IProduct[]>([]);
	const [loading, setLoading] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const user = useSelector((state: RootState) => state.client.user);
	const [avatar, setAvatar] = useState<string | null>(null);
	const accessToken = Cookies.get('access_token');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { totalQuantity } = useCart();

	useEffect(() => {
		const userData = Cookies.get('user');
		if (userData) {
			const userInformation = JSON.parse(userData);
			setAvatar(userInformation.avt);
		} else {
			setAvatar(null);
		}
	}, [user]);

	const logoutHandler = () => {
		dispatch(logout());
		setAvatar(null);
		Cookies.remove('access_token');
		Cookies.remove('refresh_token');
		toast.success('Đăng xuất thành công');
		navigate('/');
	};

	const handleCartClick = () => {
		if (!accessToken) {
			toast.error("Bạn cần đăng nhập");
			navigate("/signin");
		} else {
			navigate("/cart");
		}
	};

	useEffect(() => {
		const fetchProducts = async () => {
			if (debouncedSearchTerm) {
				setLoading(true);
				try {
					const products = await getProductsByName(debouncedSearchTerm);
					setProducts(products.length > 0 ? products : []);
				} catch (error) {
					console.error("Error fetching products:", error);
					setProducts([]);
				} finally {
					setLoading(false);
				}
			} else {
				setProducts([]);
			}
		};
		fetchProducts();
	}, [debouncedSearchTerm]);

	// const Navigate = useNavigate();
	const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const { handleAddToCart } = useCart();
	const [showModal, setShowModal] = useState(false);
	const { handleAddToWishlist } = useWishlist();

	const handleCheckAdd = (product: IProduct) => {
		if (!accessToken) {
			setShowModal(true);
			return;
		}
		setSelectedProduct(product);
	};

	const addCart = () => {
		if (selectedSize && selectedColor) {
			const variants = Array.isArray(selectedProduct?.variants)
				? selectedProduct.variants
				: JSON.parse(selectedProduct?.variants || "[]");
			const selectedVariant = variants.find(
				(variant: any) => variant.color === selectedColor
			);

			if (selectedVariant) {
				const selectedSizeObj = selectedVariant.sizes.find(
					(sizeObj: any) => sizeObj.size === selectedSize
				);

				if (selectedSizeObj && selectedSizeObj.quantity > 0) {
					const productVariantId = parseInt(
						selectedSizeObj.product_variant_id,
						10
					);
					// const colorId = selectedVariant.color_id;
					// const quantity = 1;
					// const size = selectedSize;
					if (!isNaN(productVariantId)) {
						handleAddToCart(productVariantId, 1);

						setShowModal(false);
						setSelectedSize(null);
						setSelectedColor(null);

						toast.success("Thêm vào giỏ hàng thành công!");
					} else {
						toast.error("Product Variant ID không hợp lệ.");
					}
				} else {
					toast.error("Size hoặc sản phẩm không khả dụng.");
				}
			} else {
				toast.error("Không tìm thấy màu được chọn.");
			}
		} else {
			toast.error("Hãy chọn kích thước và màu trước khi thêm vào giỏ hàng.");
		}
	};

	// const parseVariants = (variantsStr: string) => {
	// 	try {
	// 		const variants = JSON.parse(variantsStr);
	// 		const uniqueVariants = variants.reduce((acc: any[], curr: any) => {
	// 			const exists = acc.find((item) => item.color_id === curr.color_id);
	// 			if (!exists) {
	// 				acc.push(curr);
	// 			}
	// 			return acc;
	// 		}, []);
	// 		return uniqueVariants;
	// 	} catch (error) {
	// 		return [];
	// 	}
	// };

	// const getVariantsForColor = (colorId: number) => {
	// 	if (!selectedProduct) return [];

	// 	const variants = parseVariants(
	// 		typeof selectedProduct.variants === 'string'
	// 			? selectedProduct.variants
	// 			: JSON.stringify(selectedProduct.variants)
	// 	);
	// 	const colorVariant = variants.find(
	// 		(variant: any) => variant.color_id === colorId
	// 	);

	// 	return colorVariant?.sizes || [];
	// };

	const closeModal = () => {
		setSelectedProduct(null);
		setSelectedSize(null);
		setSelectedColor(null);
		setShowModal(false);
	};

	const handleLoginNow = () => {
		navigate("/signin");
		closeModal();
	};

	const RatingStars = ({ rating }: { rating: number }) => {
		return (
			<div className="flex items-center">
				{[...Array(5)].map((_, index) => (
					<span key={index}>
						{index < Math.floor(rating) ? (
							<AiFillStar className="text-yellow-400 text-xs" />
						) : (
							<AiOutlineStar className="text-yellow-400 text-xs" />
						)}
					</span>
				))}
			</div>
		);
	};

	const renderColors = () => {
		if (!selectedProduct?.variants) return null;

		const variants = Array.isArray(selectedProduct.variants)
			? selectedProduct.variants
			: JSON.parse(selectedProduct.variants);
		const uniqueColors = [
			...new Set(variants.map((v: any) => v.color)),
		] as string[];

		return uniqueColors.map((color) => (
			<button
				key={color}
				className={`px-6 py-2 border rounded-md ${selectedColor === color ? "bg-blue-500 text-white" : ""
					}`}
				onClick={() => setSelectedColor(color)}
			>
				{color}
			</button>
		));
	};

	const renderSizes = () => {
		if (!selectedColor || !selectedProduct?.variants) return null;

		const variants = Array.isArray(selectedProduct.variants)
			? selectedProduct.variants
			: JSON.parse(selectedProduct.variants);

		const selectedVariant = variants.find(
			(variant: any) => variant.color === selectedColor
		);

		const uniqueSizes = Array.from(
			new Set(
				selectedVariant?.sizes.map((sizeVariant: any) => sizeVariant.size)
			)
		).sort((a, b) => Number(a) - Number(b));

		uniqueSizes.map((size) => {
			const sizeVariant = selectedVariant?.sizes.find(
				(sv: any) => sv.size === size
			);
			const isAvailable = sizeVariant?.quantity > 0;

			return (
				<button
					className={`px-6 py-2 border rounded-md ${selectedSize === size ? "bg-blue-500 text-white" : ""
						} ${!isAvailable
							? "opacity-50 cursor-not-allowed line-through"
							: "hover:border-blue-500"
						}`}
					onClick={() => isAvailable && setSelectedSize(String(size))}
					disabled={!isAvailable}
				>
					{String(size)}
				</button>
			);
		});
	};

	return (
		<div className="drawer drawer-end sticky top-0 z-50">
			<input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content w-full">
				<div className="bg-white shadow-lg w-full">
					<div className="max-w-7xl mx-auto navbar flex justify-between items-center py-2 md:py-3 px-4">
						<Link to="/" className="flex items-center">
							<img
								src="/vector-logo/default-monochrome.svg"
								className="w-20 md:w-24"
								alt="Logo"
							/>
						</Link>

						<div className="hidden md:flex">
							<ul className="flex flex-row gap-4 lg:gap-8 font-semibold text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											to={Object.values(item)[0]}
											className="menu-item hover:text-blue-500 transition-all duration-300"
										>
											{Object.keys(item)[0]}
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="flex gap-2 md:gap-4 items-center">
							<label
								htmlFor="my-drawer-4"
								className="cursor-pointer p-1.5 md:p-2 rounded-full hover:bg-gray-100"
							>
								<IoSearch className="w-5 h-5 md:w-6 md:h-6" />
							</label>

							<button
								onClick={handleCartClick}
								className="relative p-1.5 md:p-2 rounded-full hover:bg-gray-100"
							>
								{totalQuantity > 0 && (
									<span className="badge badge-error badge-xs absolute -top-1 -right-1 text-white font-semibold">
										{totalQuantity}
									</span>
								)}
								<MdOutlineShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
							</button>

							<div className="dropdown dropdown-end">
								<div
									tabIndex={0}
									role="button"
									className="rounded-full flex items-center hover:bg-gray-100"
								>
									{user.name ? (
										<div className="avatar">
											<div className="w-8 rounded-full border-2 border-info">
												<img src={avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} />
											</div>
										</div>
									) : (<FaUser className="w-5 h-5 md:w-6 md:h-6" />)}
								</div>
								<ul className="dropdown-content bg-white shadow-lg rounded-lg p-2 w-44 md:w-48 mt-2 text-sm font-medium text-gray-700 border border-gray-200">
									{accessToken ? (
										<>
											<li>
												<Link
													to="/account"
													className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
												>
													<UserRound size={16} /> Tài khoản
												</Link>
											</li>
											{(user.role === 'admin' ||
												user.role === 'super-admin') && (
													<li>
														<Link
															to="/admin"
															className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
														>
															<MdDashboard size={16} /> Bảng điều khiển
														</Link>
													</li>
												)}
											<li>
												<button
													onClick={logoutHandler}
													className="flex items-center w-full gap-2 p-2 rounded-lg hover:bg-gray-200"
												>
													<LogOut size={16} /> Đăng xuất
												</button>
											</li>
										</>
									) : (
										<>
											<li>
												<Link
													to="/signin"
													className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
												>
													<LogIn size={16} /> Đăng nhập
												</Link>
											</li>
											<li>
												<Link
													to="/signup"
													className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200"
												>
													<SquarePen size={16} /> Đăng ký
												</Link>
											</li>
										</>
									)}
								</ul>
							</div>

							<button
								className="md:hidden p-1.5 rounded-full hover:bg-gray-100"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								{isMenuOpen ? (
									<X className="w-5 h-5" />
								) : (
									<Menu className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile Menu */}
					{isMenuOpen && (
						<div className="md:hidden bg-white shadow-lg">
							<ul className="flex flex-col p-4">
								{[
									"TRANG CHỦ",
									"THƯƠNG HIỆU",
									"DANH MỤC",
									"VỀ CHÚNG TÔI",
									"TIN TỨC",
									"LIÊN HỆ",
								].map((item) => (
									<li key={item}>
										<Link
											to={
												item === "TRANG CHỦ"
													? "/"
													: `/${item.toLowerCase().replace(" ", "-")}`
											}
											className="block py-2 px-4 text-sm font-semibold hover:bg-gray-100 rounded-lg"
											onClick={() => setIsMenuOpen(false)}
										>
											{item}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			{/* Drawer Sidebar (unchanged) */}
			<div className="drawer-side">
				<label htmlFor="my-drawer-4" className="drawer-overlay"></label>
				<div className="bg-white shadow-lg w-[90%] sm:w-[80%] md:w-[35%] h-screen overflow-y-auto p-4 md:p-6 rounded-l-xl">
					{/* Search Input */}
					<div className="flex items-center gap-2">
						<label className="input input-bordered flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
							<input
								type="text"
								placeholder="Tìm kiếm"
								className="bg-transparent outline-none w-full text-sm md:text-base"
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<IoSearch className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
						</label>
						<button className="btn btn-outline btn-sm md:btn-md rounded-full font-semibold">
							Hủy
						</button>
					</div>

					{/* Search Results */}
					<div className="mt-6">
						{debouncedSearchTerm ? (
							<>
								<p className="text-lg font-semibold text-gray-700">
									Gợi ý hàng đầu
								</p>
								<ul className="flex flex-col gap-1 mt-2 text-sm font-medium text-gray-600">
									<li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
										Nike
									</li>
									<li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
										Adidas
									</li>
									<li className="hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
										Puma
									</li>
								</ul>
							</>
						) : (
							<>
								<p className="text-lg font-semibold text-gray-700">
									Tìm kiếm phổ biến
								</p>
								<div className="flex flex-wrap gap-2 mt-2">
									{["Nike", "Adidas", "Puma", "Reebok", "New Balance"].map(
										(term) => (
											<button
												key={term}
												className="btn btn-outline rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
											>
												{term}
											</button>
										)
									)}
								</div>
							</>
						)}

						{/* Product Suggestions */}
						<div className="mt-4">
							{loading ? (
								<div className="flex justify-center items-center">
									<span className="loading loading-spinner loading-lg"></span>
								</div>
							) : debouncedSearchTerm && products.length > 0 ? (
								<>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										Gợi ý sản phẩm
									</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
										{products.map((product) => (
											<div
												key={product.id}
												className="bg-white rounded-lg shadow-md p-3"
											>
												<div className="relative w-full overflow-hidden group">
													<img
														src={product.thumbnail}
														alt={product.name}
														className="w-full h-40 object-cover transition-transform duration-300 transform group-hover:scale-105"
													/>

													{product.promotional_price > 0 && (
														<p className="absolute top-2 right-2 text-white bg-red-600 text-xs font-semibold px-2 py-1 rounded-full z-10">
															{Math.round(
																((Number(product.price) -
																	Number(product.promotional_price)) /
																	Number(product.price)) *
																100
															)}
															%
														</p>
													)}
													<div className="absolute hidden group-hover:flex w-full h-full top-0 left-0 bg-opacity-70 bg-gray-50 justify-center items-center gap-4 z-10">
														<IoHeartOutline
															onClick={() => handleAddToWishlist(product.id)}
															className="cursor-pointer p-3 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
															size={40}
															color="#40BFFF"
														/>
														<IoCart
															onClick={() => handleCheckAdd(product)}
															className="cursor-pointer p-3 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
															size={40}
															color="#40BFFF"
														/>
													</div>
												</div>

												<div className="p-4">
													<Link to={`/products/${product.id}`}>
														<h3 className="text-[14px] font-semibold text-gray-800 hover:text-primary transition">
															{product.name}
														</h3>
													</Link>

													<div className="flex flex-row items-center justify-start gap-1 mt-1">
														<RatingStars rating={product.rating_count} />
													</div>

													<p className="text-gray-600 text-sm mt-1">
														<div
															dangerouslySetInnerHTML={{
																__html:
																	product.description.length > 100
																		? `${product.description.substring(
																			0,
																			100
																		)}...`
																		: product.description,
															}}
														></div>
													</p>

													<div className="flex justify-between items-center mt-2">
														<div className="flex items-center space-x-2">
															{product.promotional_price &&
																product.promotional_price > 0 ? (
																<>
																	<p className="font-bold text-blue-600 text-lg">
																		{formatVNCurrency(
																			Number(product.promotional_price)
																		)}
																	</p>
																	<p className="text-gray-500 text-xs line-through">
																		{formatVNCurrency(Number(product.price))}
																	</p>
																</>
															) : (
																<p className="font-bold text-blue-600 text-lg">
																	{formatVNCurrency(Number(product.price))}
																</p>
															)}
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							) : debouncedSearchTerm ? (
								<p className="text-gray-500">Không tìm thấy kết quả.</p>
							) : null}
						</div>
					</div>
				</div>
			</div>

			{selectedProduct && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
					<div className="modal modal-open">
						<div className="modal-box relative">
							<h3 className="font-bold text-xl text-blue-500">
								{selectedProduct.name}
							</h3>
							<p className="mt-2">Chọn kích thước và màu sắc:</p>
							<div className="flex flex-col gap-6 mt-4">
								<div>
									<h4 className="text-lg font-semibold mb-2">Màu sắc:</h4>
									<div className="flex flex-wrap gap-2">{renderColors()}</div>
								</div>

								{selectedColor && (
									<div className="mt-4">
										<h4 className="text-lg font-semibold mb-2">Kích thước:</h4>
										<div className="flex flex-wrap gap-2">{renderSizes()}</div>
									</div>
								)}
							</div>

							<div className="mt-6 flex justify-end gap-4">
								<button
									className="btn bg-gray-300 text-black"
									onClick={() => {
										setSelectedProduct(null);
										setSelectedSize(null);
										setSelectedColor(null);
									}}
								>
									Hủy
								</button>
								<button
									className="btn bg-blue-500 text-white"
									onClick={addCart}
									disabled={!selectedSize || !selectedColor}
								>
									Thêm vào giỏ hàng
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showModal && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
					<div className="modal modal-open">
						<div className="modal-box relative">
							<h3 className="font-bold text-xl">Bạn cần đăng nhập</h3>
							<p className="mt-2">
								Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.
							</p>
							<div className="mt-4 flex justify-end gap-4">
								<button
									className="btn bg-gray-300 text-black"
									onClick={closeModal}
								>
									Đóng
								</button>
								<button
									className="btn bg-blue-500 text-white"
									onClick={handleLoginNow}
								>
									Đăng nhập ngay
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Navbar;
