import { Heart, ShoppingCart } from 'lucide-react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { IProduct } from '../../../types/client/products/products';
import useCart from '../../../hooks/client/useCart';
import useWishlist from '../../../hooks/client/useWhishList';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { formatVNCurrency } from '../../../common/formatVNCurrency';
import toast from 'react-hot-toast';

const ProductCardListSkeleton = () => {
	return (
		<div className="flex flex-row gap-5 animate-pulse">
			{/* Skeleton cho hình ảnh */}
			<div className="w-1/3">
				<div className="w-[350px] h-[300px] bg-gray-200 rounded-md"></div>
			</div>

			{/* Skeleton cho thông tin sản phẩm */}
			<div className="w-1/3 ml-9">
				<div className="flex flex-col justify-between items-start h-full gap-2 p-2">
					{/* Skeleton cho tiêu đề */}
					<div className="w-1/3 h-6 bg-gray-200 rounded-md"></div>
					<div className="w-2/3 h-1 bg-gray-200 rounded-md"></div>

					{/* Skeleton cho rating */}
					<div className="flex flex-row gap-2 items-center">
						<div className="w-16 h-4 bg-gray-200 rounded-md"></div>
						<div className="w-12 h-4 bg-gray-200 rounded-md"></div>
					</div>

					{/* Skeleton cho giá */}
					<div className="flex flex-row gap-2 items-center">
						<div className="w-20 h-6 bg-gray-200 rounded-md"></div>
						<div className="w-16 h-4 bg-gray-200 rounded-md"></div>
						<div className="w-12 h-4 bg-gray-200 rounded-md"></div>
					</div>

					{/* Skeleton cho các nút */}
					<div className="flex flex-row gap-2 ">
						<div className="w-32 h-13 bg-gray-200 rounded-md"></div>
						<div className="w-32 h-13 bg-gray-200 rounded-md"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

const ProductCardList = ({
	product,
	isLoading,
}: {
	product: any;
	isLoading: boolean;
}) => {
	const { handleAddToCart } = useCart();
	const accessToken = Cookies.get('access_token');
	const navigate = useNavigate();
	const [showModal, setShowModal] = useState(false);
	const [modalCheckLogin, setModalCheckLogin] = useState(false);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState<string | null>(null);
	const { handleAddToWishlist } = useWishlist();

	// Thêm sản phẩm vào giỏ hàng
	const addCart = () => {
		if (selectedSize && selectedColor) {
			const variants = parseVariants(product?.variants || []);
			const selectedVariant = variants.find(
				(variant: any) => variant.color === selectedColor
			);

			if (selectedVariant) {
				const selectedSizeObj = selectedVariant.sizes.find(
					(sizeObj: any) => sizeObj.size === selectedSize
				);

				if (selectedSizeObj && selectedSizeObj.quantity > 0) {
					const productVariantId = selectedSizeObj.product_variant_id;
					const quantity = 1;

					handleAddToCart(productVariantId, quantity);
					setShowModal(false);
					setSelectedSize(null);
					setSelectedColor(null);
				} else {
					toast.error('Size or product is not available.');
				}
			} else {
				toast.error('Selected color not found.');
			}
		} else {
			toast.error('Please select size and color before adding to cart.');
		}
	};

	const handleCheckAdd = () => {
		if (!accessToken) {
			setModalCheckLogin(true);
			setShowModal(false);
			return;
		}
		setShowModal(true);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<ProductCardListSkeleton />;
			</div>
		);
	}

	const parseVariants = (variants: string | any[]) => {
		try {
			return Array.isArray(variants) ? variants : JSON.parse(variants);
		} catch (error) {
			console.error('Error parsing variants:', error);
			return [];
		}
	};

	const getVariantsForColor = (color: string) => {
		if (!product) return [];

		return parseVariants(product.variants)
			.filter((variant: any) => variant.color === color)
			.flatMap((variant: any) => variant.sizes);
	};

	const closeModal = () => {
		setShowModal(false);
		setModalCheckLogin(false);
	};
	const handleLoginNow = () => {
		navigate('/signin');
		closeModal();
	};

	// Hiển thị sao đánh giá
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

	return (
		<div className="flex flex-row gap-5 shadow-md border border-gray-200 rounded-lg overflow-hidden">
			<div key={product.id} className="w-1/3">
				<img
					className="w-[650px] h-[300px] object-cover"
					src={product.thumbnail}
					alt={product.name}
				/>
			</div>
			<div className="w-2/3">
				<div className="flex flex-col justify-between items-start h-full gap-2 p-2">
					<h3 className="text-2xl font-semibold">{product.name}</h3>
					<div className="flex flex-row gap-2 items-center">
						<div className="rating flex flex-row items-center gap-1">
							<RatingStars rating={product.rating_count} />
						</div>
						<p className="text-sm text-[#C1C8CE]">12 reviews</p>
					</div>
					<hr className="w-2/3" />
					<div className="flex flex-row gap-2 items-center">
						<p className="text-xl font-semibold text-[#40BFFF]">
							{formatVNCurrency(product.promotional_price)} ₫
						</p>
						<p className="text-sm line-through text-[#C1C8CE]">
							{formatVNCurrency(product.price)} ₫
						</p>
						<p className="text-sm text-[#FF4242] font-semibold">
							-6% Off
						</p>
					</div>
					<p>{product.description}</p>
					<div className="flex flex-row gap-2">
						{/* Nút thêm sản phẩm vào giỏ hàng */}
						<button
							onClick={() => handleCheckAdd()}
							className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] px-10 flex flex-row gap-2 items-center"
						>
							<ShoppingCart /> Add to cart
						</button>

						{/* Nút thêm vào wishlist */}
						<button
							onClick={() => handleAddToWishlist(product.id)}
							className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] flex flex-row gap-2 items-center"
						>
							<Heart /> Add to wishlist
						</button>
					</div>
				</div>
			</div>

			{showModal && (
				<div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
					<div className="modal modal-open">
						<div className="modal-box relative">
							<h3 className="font-bold text-xl text-blue-500">
								{product.name}
							</h3>
							<p className="mt-2">Select size and color:</p>
							<div className="flex flex-col gap-6 mt-4">
								<div>
									<h4 className="text-lg font-semibold mb-2">Size:</h4>
									<div className="flex flex-wrap gap-2">
										{selectedColor &&
											getVariantsForColor(selectedColor)
												.sort((a: any, b: any) => a.size - b.size)
												.map((variant: any) => {
													const isSizeAvailable =
														variant.quantity > 0;
													const isSelected =
														selectedSize === variant.size;

													return (
														<button
															key={variant.size}
															className={`px-8 py-2 text-center text-sm font-medium border rounded-md transition ${
																isSelected
																	? 'border-theme-color-primary ring-2 ring-theme-color-primary'
																	: 'bg-white text-gray-700 border-gray-300'
															} ${
																!isSizeAvailable
																	? 'cursor-not-allowed opacity-50 line-through'
																	: 'hover:border-theme-color-primary'
															}`}
															onClick={() => {
																if (isSizeAvailable) {
																	setSelectedSize(
																		variant.size
																	);
																}
															}}
															disabled={!isSizeAvailable}
														>
															{variant.size}
														</button>
													);
												})}
									</div>
								</div>

								<div>
									<h4 className="text-lg font-semibold mb-2">
										Color:
									</h4>
									<div className="flex flex-wrap gap-2">
										{parseVariants(product.variants)
											.map((variant: any) => variant.color)
											.filter(
												(
													value: string,
													index: number,
													self: string[]
												) => self.indexOf(value) === index
											)
											.map((color: string) => {
												const isSelected = selectedColor === color;
												return (
													<button
														key={color}
														className={`px-6 py-2 border rounded-md hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary flex items-center gap-2 ${
															isSelected
																? 'bg-theme-color-primary outline-none ring-2'
																: ''
														}`}
														onClick={() =>
															setSelectedColor(color)
														}
													>
														{color}
													</button>
												);
											})}
									</div>
								</div>
							</div>

							<div className="mt-4 flex justify-end gap-4">
								<button
									className="btn bg-gray-300 text-black"
									onClick={closeModal}
								>
									Cancel
								</button>
								<button
									className="btn bg-blue-500 text-white"
									onClick={addCart}
									disabled={!selectedSize || !selectedColor}
								>
									Add to Cart
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{modalCheckLogin && (
				<div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center">
					<div className="modal modal-open">
						<div className="modal-box relative">
							<h2 className="text-2xl font-semibold text-center mb-4">
								Please log in to continue adding items to your cart.
							</h2>
							<div className="flex justify-center gap-4">
								<button
									onClick={handleLoginNow}
									className="btn bg-blue-500 text-white hover:bg-blue-600"
								>
									Login Now
								</button>
								<button
									onClick={closeModal}
									className="btn bg-gray-300 text-black hover:bg-gray-400"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductCardList;
