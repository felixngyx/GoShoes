import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FaShoppingCart } from 'react-icons/fa';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import { useParams, useNavigate, useNavigation, Link } from 'react-router-dom';
import useCart from '../../../hooks/client/useCart';
// import { getProductById } from '../../../services/client/product';
// import { Category } from '../../../types/client/category';
// import { IImages } from '../../../types/client/products/images';
import RelatedProduct from '../ProductList/RelatedProduct';
import { toast } from 'react-hot-toast';
import { formatVNCurrency } from '../../../common/formatVNCurrency';
import { gellReviewByProductId } from '../../../services/client/review';
import Cookies from 'js-cookie';
import { addProductToWishlist } from '../../../services/client/whishlist';
import axiosClient from '../../../apis/axiosClient';
import ZoomImage from '../../../components/common/ZoomImage';

interface Variant {
	color_id: number;
	color_name: string;
	image: string;
	variant_details: Array<{
		size: string;
		quantity: number;
		variant_id: number;
	}>;
}

interface Review {
	user: {
		name: string;
		avt: string;
	};
	rating: number;
	comment: string;
	created_at: string;
}

interface PaginationLink {
	url: string | null;
	label: string;
	active: boolean;
}

interface ReviewResponse {
	current_page: number;
	data: Review[];
	last_page: number;
	links: PaginationLink[];
	total: number;
}

const ProductDetailSkeleton = () => {
	return (
		<div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-10">
				{/* Left Section - Product Images Skeleton */}
				<div className="md:col-span-5">
					<div className="relative overflow-hidden rounded-lg bg-gray-200 animate-pulse mb-2 h-[571px]" />
					<div className="grid grid-cols-4 gap-2">
						{[1, 2, 3, 4].map((index) => (
							<div
								key={index}
								className="h-24 bg-gray-200 animate-pulse rounded-md"
							/>
						))}
					</div>
				</div>

				{/* Right Section - Product Information Skeleton */}
				<div className="md:col-span-5 space-y-4">
					{/* Product Name */}
					<div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />

					{/* Rating & Reviews */}
					<div className="flex items-center gap-4">
						<div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
						<div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
					</div>

					{/* Price */}
					<div className="flex items-center gap-3">
						<div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
						<div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
						<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
					</div>

					<hr />

					{/* Product Details */}
					<div className="space-y-4">
						{[1, 2, 3].map((index) => (
							<div key={index} className="grid grid-cols-2 max-w-xs">
								<div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
								<div className="h-6 bg-gray-200 animate-pulse rounded w-32" />
							</div>
						))}
					</div>

					{/* Size Selection */}
					<div className="grid grid-cols-2 max-w-xs">
						<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
						<div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
					</div>

					{/* Color Selection */}
					<div className="space-y-2">
						<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
						<div className="flex flex-wrap gap-2">
							{[1, 2, 3, 4].map((index) => (
								<div
									key={index}
									className="h-10 bg-gray-200 animate-pulse rounded w-24"
								/>
							))}
						</div>
					</div>

					{/* Quantity */}
					<div className="flex items-center gap-4">
						<div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
						<div className="h-10 bg-gray-200 animate-pulse rounded w-32" />
						<div className="h-10 bg-gray-200 animate-pulse rounded w-10" />
					</div>

					{/* Buttons */}
					<div className="grid grid-cols-2 gap-4">
						<div className="h-12 bg-gray-200 animate-pulse rounded" />
						<div className="h-12 bg-gray-200 animate-pulse rounded" />
					</div>
				</div>

				{/* Best Sellers Skeleton */}
				<div className="md:col-span-2">
					<div className="h-6 bg-gray-200 animate-pulse rounded w-24 mb-2" />
					<div className="space-y-4 border rounded-sm p-4">
						<div className="h-40 bg-gray-200 animate-pulse rounded" />
						<div className="flex justify-center">
							<div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
						</div>
						<div className="flex justify-center gap-2">
							<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
							<div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
						</div>
					</div>
				</div>

				{/* Description Tab Skeleton */}
				<div className="mt-8 col-span-1 md:col-span-10 bg-[#FAFAFB] p-5 rounded-lg shadow-md">
					<div className="flex gap-4 md:gap-28 border-b mb-4">
						{['Description', 'Reviews', 'Write Comment'].map((tab) => (
							<div
								key={tab}
								className="h-8 bg-gray-200 animate-pulse rounded w-24"
							/>
						))}
					</div>
					<div className="space-y-4">
						{[1, 2, 3].map((index) => (
							<div
								key={index}
								className="h-4 bg-gray-200 animate-pulse rounded w-full"
							/>
						))}
					</div>
				</div>

				{/* Related Products Skeleton */}
				<div className="col-span-1 md:col-span-10">
					<div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-4" />
					<div className="grid grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((index) => (
							<div key={index} className="border rounded-lg p-4">
								<div className="h-40 bg-gray-200 animate-pulse rounded mb-2" />
								<div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-2" />
								<div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

const ProductDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { data: product, isLoading } = useQuery({
		queryKey: ['PRODUCT_KEY', id],
		queryFn: async () => {
			const response = await axiosClient.get(`/client/products/${id}`);
			return response.data.data;
		},
	});
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(
		null
	);
	const [selectedColor, setSelectedColor] = useState<number | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [activeTab, setActiveTab] = useState<
		'description' | 'reviews' | 'writeComment'
	>('description');
	const [comments, setComments] = useState<string[]>([]);
	const [newComment, setNewComment] = useState('');
	const [currentSlide, setCurrentSlide] = useState(0);
	const [availableQuantity, setAvailableQuantity] = useState(0);
	const { handleAddToCartDetail } = useCart();
	const [allImages, setAllImages] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [isExpanded, setIsExpanded] = useState(false);
	const [shouldShowButton, setShouldShowButton] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	// Xử lý variants an toàn hơn
	const parsedVariants = useMemo(() => {
		if (!product?.variants) return [];
		return product.variants;
	}, [product?.variants]);

	// Xử lý uniqueColors an toàn hơn
	const uniqueColors = useMemo(() => {
		return parsedVariants.map((variant: any) => ({
			id: variant.color_id,
			color: variant.color_name,
			image: variant.image ? variant.image.split(',')[0].trim() : null,
			allImages: variant.image
				? variant.image.split(',').map((img: string) => img.trim())
				: [],
			sizes: variant.variant_details,
		}));
	}, [parsedVariants]);

	// Xử lý selectedColor và images
	useEffect(() => {
		if (!product) return;

		const variants = parsedVariants;

		if (!selectedColor && variants.length > 0) {
			const firstColorId = variants[0]?.color_id;
			setSelectedColor(firstColorId);
			return;
		}

		if (selectedColor) {
			const selectedVariant = variants.find(
				(variant: Variant) => variant.color_id === selectedColor
			);

			if (selectedVariant?.image) {
				const images = selectedVariant.image
					.split(',')
					.map((img: string) => img.trim());
				setSelectedThumbnail(images[0] || product.thumbnail);
				setAllImages(images);
			} else {
				setSelectedThumbnail(product.thumbnail);
				setAllImages([product.thumbnail]);
			}

			// Xử lý sizes
			const availableSize = selectedVariant?.variant_details?.find(
				(detail: any) => detail?.quantity > 0
			);

			if (availableSize) {
				setSelectedSize(availableSize.size);
				setAvailableQuantity(availableSize.quantity);
			} else {
				setSelectedSize(null);
				setAvailableQuantity(0);
			}
		} else {
			setSelectedThumbnail(product.thumbnail);
			setAllImages([product.thumbnail]);
		}
	}, [product, selectedColor, parsedVariants]);

	// Xử lý color change
	const handleColorChange = (colorId: number, imageUrl: string) => {
		setSelectedColor(colorId);
		setSelectedThumbnail(imageUrl || product?.thumbnail);

		// Reset size khi đổi màu
		setSelectedSize(null);
		setAvailableQuantity(0);
	};

	const handleAdd = () => {
		const accessToken = Cookies.get('access_token');
		if (!accessToken) {
			toast.error('Please login to add to cart');
			navigate('/signin');
			return;
		}

		if (!selectedSize || !selectedColor) {
			toast.error('Select a Size and Color to add to cart.');
			return;
		}

		const selectedVariant = parsedVariants.find(
			(variant: Variant) => variant.color_id === selectedColor
		);

		const selectedSizeDetails = selectedVariant?.variant_details?.find(
			(detail: any) => detail.size === selectedSize
		);

		if (selectedVariant && selectedSizeDetails) {
			const variantId = selectedSizeDetails.variant_id;

			if (!variantId) {
				toast.error('Product Variant ID is missing.');
				return;
			}

			handleAddToCartDetail(
				variantId,
				selectedSize,
				selectedVariant.color_name,
				quantity
			);
		} else {
			toast.error('Selected size or color is unavailable.');
		}
	};

	const handleAddToWishlist = () => {
		if (product?.id) {
			const productToAdd = {
				product_id: product.id,
			};

			addProductToWishlist(productToAdd)
				.then(() => {
					toast.success('The product has been added to your wishlist!');
				})
				.catch(() => {
					toast.error(
						'Failed to add the product to your wishlist. Please try again.'
					);
				});
		} else {
			toast.error('Invalid product information.');
		}
	};

	const handleSizeChange = (size: string) => {
		setSelectedSize(size);

		// Cập nhật availableQuantity dựa trên size mới
		const selectedVariant = parsedVariants.find(
			(variant: Variant) => variant.color_id === selectedColor
		);

		const sizeDetails = selectedVariant?.variant_details?.find(
			(detail: any) => detail.size === size
		);

		if (sizeDetails) {
			setAvailableQuantity(sizeDetails.quantity);
			// Reset quantity về 1 khi đổi size
			setQuantity(1);
		}
	};

	const uniqueSizes = selectedColor
		? Array.from(
				parsedVariants
					.filter((variant: Variant) => variant.color_id === selectedColor)
					.flatMap(
						(variant: Variant) =>
							variant.variant_details?.map((detail: any) => ({
								size: detail.size,
								disabled: detail.quantity === 0,
								quantity: detail.quantity,
							})) || []
					)
					.reduce(
						(
							acc: Map<
								string,
								{ size: string; disabled: boolean; quantity: number }
							>,
							current: any
						) => {
							if (!acc.has(current.size)) {
								acc.set(current.size, current);
							}
							return acc;
						},
						new Map()
					)
					.values()
		  )
				.map((value: any) => value)
				.sort((a: any, b: any) => parseFloat(a.size) - parseFloat(b.size))
		: [];

	const handleQuantityChange = (value: number) => {
		const newQuantity = quantity + value;

		if (newQuantity < 1) {
			setQuantity(1);
		} else if (newQuantity > availableQuantity) {
			alert(
				`Số lượng hiện tại là ${availableQuantity}. Không thể mua nhiều hơn.`
			);
			setQuantity(availableQuantity); // Reset về số lượng tối đa
		} else {
			setQuantity(newQuantity); // Cập nhật s lượng hợp lệ
		}
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

	// Function to handle adding a new comment
	const handleAddComment = () => {
		if (newComment.trim()) {
			setComments([...comments, newComment]);
			setNewComment('');
		}
	};

	const handleNextSlide = () => {
		if (allImages && allImages.length > 0) {
			const nextIndex = (currentSlide + 1) % allImages.length;
			setCurrentSlide(nextIndex);
			setSelectedThumbnail(allImages[nextIndex]);
		}
	};

	const handlePrevSlide = () => {
		if (allImages && allImages.length > 0) {
			const prevIndex =
				(currentSlide - 1 + allImages.length) % allImages.length;
			setCurrentSlide(prevIndex);
			setSelectedThumbnail(allImages[prevIndex]);
		}
	};

	const handleBuyNow = (e: React.MouseEvent) => {
		e.preventDefault();

		if (!selectedSize || !selectedColor) {
			toast.error('Vui lòng chọn size và màu sắc trước khi mua hàng');
			return;
		}

		const selectedVariant = parsedVariants.find(
			(variant: Variant) => variant.color_id === selectedColor
		);

		const selectedSizeDetails = selectedVariant?.variant_details?.find(
			(detail: any) => detail.size === selectedSize
		);

		if (selectedVariant && selectedSizeDetails) {
			const variantInfo = {
				id: selectedSizeDetails.variant_id,
				size: {
					size: selectedSize,
				},
				color: {
					color: selectedVariant.color_name,
				},
			};

			navigate('/checkout', {
				state: {
					productInfo: {
						id: product.id,
						name: product.name,
						price:
							product.original_promotional_price ||
							product.original_price,
						thumbnail: selectedThumbnail || product.thumbnail,
						quantity,
						variant: variantInfo,
						total:
							(product.original_promotional_price ||
								product.original_price) * quantity,
					},
				},
			});
		} else {
			toast.error('Không tìm thấy phiên bản sản phẩm phù hợp');
		}
	};

	const accessToken = Cookies.get('access_token');

	const { data: reviewData } = useQuery<ReviewResponse>({
		queryKey: ['PRODUCT_REVIEWS', product?.id],
		queryFn: () => gellReviewByProductId(product?.id),
	});

	// Thêm useEffect để kiểm tra chiều cao của content
	useEffect(() => {
		if (contentRef.current && product?.description) {
			// Nếu nội dung cao hơn 200px thì hiện nút xem thêm
			setShouldShowButton(contentRef.current.scrollHeight > 200);
		}
	}, [product?.description]);

	if (isLoading) {
		return <ProductDetailSkeleton />;
	}

	return (
		<div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
			<div className="grid grid-cols-1 md:grid-cols-12 gap-10 px-4 lg:px-0">
				{/* Left Section - Product Images */}
				<div className="md:col-span-6 lg:col-span-5 col-span-1">
					<div className="relative overflow-hidden rounded-lg bg-gray-100 mb-2">
						<ZoomImage
							src={selectedThumbnail || product.thumbnail}
							alt={product.name}
						/>
					</div>
					<div className="flex items-center justify-between relative z-10">
						<button
							onClick={handlePrevSlide}
							className="p-2 hover:bg-gray-100 rounded-full absolute left-0 top-1/2 -translate-y-1/2 z-10"
						>
							<ChevronLeft color="#9098B1" />
						</button>
						<div className="mt-4">
							<div className="flex flex-wrap gap-3">
								{allImages && allImages.length > 0 ? (
									allImages.map((image, index) => (
										<button
											key={index}
											onClick={() => setSelectedThumbnail(image)} // Cập nhật hình ảnh được chọn
											className={`relative overflow-hidden rounded-md ${
												selectedThumbnail === image
													? 'ring-2 ring-theme-color-primary'
													: ''
											}`}
										>
											<img
												src={image}
												alt={`product-image-${index}`}
												className="w-20 h-20 rounded-md border border-gray-300 object-cover"
											/>
										</button>
									))
								) : (
									<p>No images available</p>
								)}
							</div>
						</div>

						<button
							onClick={handleNextSlide}
							className="p-2 hover:bg-gray-100 rounded-full absolute right-0 top-1/2 -translate-y-1/2 z-10"
						>
							<ChevronRight color="#9098B1" />
						</button>
					</div>
				</div>

				{/* Right Section - Product Information */}
				<div className="md:col-span-6 lg:col-span-5 col-span-1">
					<h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
					<div className="flex items-center gap-4 mb-2">
						<RatingStars rating={product.rating_count} />
						<span className="text-[#9098B1] text-sm">
							{product.reviews}
							<span className="text-sm text-gray-600">
								{product.rating_count} reviews
							</span>
						</span>
					</div>
					<div className="flex items-center gap-2 mt-1 mb-3">
						{product?.promotional_price ? (
							// Nếu có promotional_price thì hiển thị cả giá khuyến mãi và giá gốc
							<>
								<p className="text-primary text-lg font-semibold">
									{formatVNCurrency(Number(product?.promotional_price))}
								</p>
								<p className="text-[#9098B1] text-sm font-medium line-through">
									{formatVNCurrency(Number(product?.price))}
								</p>
								<p className="text-[#E71D36] text-sm font-semibold">
									{Math.round(
										((Number(product?.price) -
											Number(product?.promotional_price)) /
											Number(product?.price)) *
											100
									)}
									%
								</p>
							</>
						) : (
							// Nếu không có promotional_price thì chỉ hiển thị giá gốc
							<p className="text-primary text-lg font-semibold">
								{formatVNCurrency(Number(product?.price))}
							</p>
						)}
					</div>

					<hr className="my-4" />

					<div className="space-y-4 mb-6">
						<div className="grid grid-cols-2 max-w-xs">
							<span className="col-span-1">Category:</span>
							<span className="col-span-1 text-left">
								{product.categories && Array.isArray(product.categories)
									? [
											...new Set(
												product.categories.map(
													(category: { name: string }) =>
														category.name
												)
											),
									  ].join(', ')
									: 'No categories available'}
							</span>
						</div>
						<div className="grid grid-cols-2 max-w-xs">
							<span className="col-span-1">Brand:</span>
							<span className="col-span-1 text-left">
								{product.brand.name}
							</span>
						</div>
						<div className="grid grid-cols-2 max-w-xs">
							<span className="col-span-1">Availability:</span>
							<span className="col-span-1 text-left">
								{availableQuantity} units
							</span>
						</div>
					</div>

					<div className="mb-3 max-w-xs">
						<span className="mb-2 text-lg font-semibold">Size:</span>
						<div className="grid grid-cols-3 gap-2">
							{uniqueSizes.length > 0 ? (
								uniqueSizes.map((sizeInfo: any) => (
									<button
										key={sizeInfo.size}
										onClick={() => !sizeInfo.disabled && handleSizeChange(sizeInfo.size)}
										className={`py-2 text-center text-sm font-medium border rounded-md w-full 
											${
												selectedSize === sizeInfo.size
													? 'border-theme-color-primary ring-2 ring-theme-color-primary'
													: 'bg-white text-gray-700 border-gray-300'
											}
											${
												sizeInfo.disabled
													? 'cursor-not-allowed opacity-50 line-through bg-gray-100'
													: 'hover:border-theme-color-primary focus:outline-none focus:ring-2 focus:ring-theme-color-primary'
											}`}
										disabled={sizeInfo.disabled}
									>
										{sizeInfo.size}
										{sizeInfo.disabled && (
											<span className="block text-xs text-gray-500">
												(Out of stock)
											</span>
										)}
									</button>
								))
							) : (
								<p className="text-gray-500 text-sm italic">
										No sizes available
								</p>
							)}
						</div>
					</div>

					<div className="mb-6">
						<h3 className="mb-2 text-lg font-semibold">Color:</h3>
						<div className="flex flex-wrap gap-3">
							{uniqueColors.length > 0 ? (
								uniqueColors.map((colorInfo: any) => {
									const hasAvailableSize = colorInfo.sizes.some(
										(size: any) => size.quantity > 0
									);
									
									return (
										<button
											key={colorInfo.id}
											onClick={() => 
												hasAvailableSize && 
												handleColorChange(colorInfo.id, colorInfo.image || product?.thumbnail)
											}
											className={`flex items-center gap-3 px-4 py-2 border rounded-md text-sm font-medium transition-all 
												${
													selectedColor === colorInfo.id
														? 'bg-theme-color-primary border-theme-color-primary ring-2 ring-theme-color-primary'
														: 'bg-white text-gray-700 border-gray-300 hover:border-theme-color-primary'
												}
												${
													!hasAvailableSize
														? 'cursor-not-allowed opacity-50 bg-gray-100'
														: ''
												}`}
											disabled={!hasAvailableSize}
										>
											<img
												className="w-8 h-8 rounded-full border border-gray-300 object-cover"
												src={colorInfo.image || product?.thumbnail}
												alt={colorInfo.color}
											/>
											<span>{colorInfo.color}</span>
											{!hasAvailableSize && (
												<span className="text-xs text-gray-500">
													(Out of stock)
												</span>
											)}
										</button>
									);
								})
							) : (
								<p className="text-gray-500 text-sm italic">
									No colors available
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-4 mb-6">
						<span className="font-semibold">Quantity:</span>
						<div className="flex items-center border rounded-md">
							<button
								onClick={() => handleQuantityChange(-1)}
								className="p-2 hover:bg-gray-100"
								aria-label="Decrease quantity"
							>
								<IoMdRemove />
							</button>
							<span className="px-4 py-2 border-x">{quantity}</span>
							<button
								onClick={() => handleQuantityChange(1)}
								className="p-2 hover:bg-gray-100"
								aria-label="Increase quantity"
							>
								<IoMdAdd />
							</button>
						</div>
						<button
							onClick={handleAddToWishlist}
							className="btn ms-auto bg-[#ebf6ff] hover:bg-[#ebf6ff]/80 hover:border-[#40BFFF]"
						>
							<Heart size={16} color="#40BFFF" />
						</button>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<button
							onClick={handleAdd}
							className="btn bg-[#ebf6ff] text-[#40BFFF] hover:bg-[#ebf6ff]/80 hover:border-[#40BFFF]"
						>
							<FaShoppingCart />
							Add to Cart
						</button>
						<button
							onClick={handleBuyNow}
							className="btn bg-[#40BFFF] text-white hover:bg-[#40a5ff] hover:border-[#40BFFF]"
						>
							Buy Now
						</button>
					</div>
				</div>

				{/* Best Sellers */}
				{product?.bestseller_info?.is_bestseller && (
					<div className="md:col-span-2 hidden md:block">
						<h3 className="text-lg font-semibold mb-2">Bestseller</h3>
						<div className="p-4 border rounded-sm">
							<div className="flex items-center gap-4">
								<div className="text-sm">
									<p>
										Total Sold: {product.bestseller_info.total_sold}
									</p>
									<p>
										Order Count: {product.bestseller_info.order_count}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Description, Reviews & Write Comment */}
				<div className="mt-8 md:col-span-12 lg:col-span-10 bg-[#FAFAFB] p-5 rounded-lg shadow-md">
					<div className="flex gap-4 md:gap-28 border-b">
						<button
							className={`px-4 py-2 ${
								activeTab === 'description'
									? 'border-b-2 border-theme-color-primary font-semibold text-[#40BFFF]'
									: ''
							}`}
							onClick={() => setActiveTab('description')}
						>
							Description
						</button>
						<button
							className={`px-4 py-2 ${
								activeTab === 'reviews'
									? 'border-b-2 border-theme-color-primary font-semibold text-[#40BFFF]'
									: ''
							}`}
							onClick={() => setActiveTab('reviews')}
						>
							Reviews
						</button>
					</div>
					<div className="p-4">
						{activeTab === 'description' && (
							<div className="relative z-10">
								<div
									ref={contentRef}
									className={`description-content overflow-hidden transition-all duration-300 relative ${
										isExpanded ? '' : 'max-h-[200px]'
									}`}
								>
									{product?.description ? (
										<div
											dangerouslySetInnerHTML={{
												__html: product.description,
											}}
										></div>
									) : (
										<p>No description available</p>
									)}
								</div>

								{/* Gradient overlay when collapsed */}
								{!isExpanded && shouldShowButton && (
									<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-20"></div>
								)}

								{/* Show more/less button */}
								{shouldShowButton && product?.description && (
									<div className="relative z-30">
										<button
											onClick={() => setIsExpanded(!isExpanded)}
											className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mx-auto bg-white rounded-md shadow-sm hover:shadow"
										>
											{isExpanded ? (
												<>
													Show Less
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 15l7-7 7 7"
														/>
													</svg>
												</>
											) : (
												<>
													Show More
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</>
											)}
										</button>
									</div>
								)}
							</div>
						)}
						{activeTab === 'reviews' && (
							<div>
								{/* Reviews List */}
								<div className="max-w-6xl mx-auto">
									<div></div>
									<div className="flex flex-col gap-8">
										{reviewData?.data.map(
											(item: Review, index: number) => (
												<div
													key={index}
													className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-[1.01]"
												>
													<div className="flex items-start justify-between mb-4">
														<div className="flex items-center space-x-4">
															<img
																src={item.user.avt}
																className="w-12 h-12 rounded-full object-cover"
															/>
															<div>
																<h3 className="text-xl font-semibold">
																	{item.user.name}
																</h3>
																<div className="flex items-center space-x-2 mt-1">
																	<RatingStars
																		rating={item.rating}
																	/>
																	<span className="text-gray-500">
																		{new Date(
																			item.created_at
																		).toLocaleDateString(
																			'vi-VN',
																			{
																				day: '2-digit',
																				month: '2-digit',
																				year: 'numeric',
																			}
																		)}
																	</span>
																</div>
															</div>
														</div>
													</div>
													<p className="text-gray-700 mb-4">
														{item.comment}
													</p>
													<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
														<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden">
															{/* <img className="w-full h-32 object-cover hover:opacity-90 transition-opacity" /> */}
														</button>
													</div>
												</div>
											)
										)}

										{/* Pagination or more reviews */}
										<div className="join bg-[#FAFAFB] rounded-md ms-auto">
											{reviewData?.links.map((link, index) => (
												<button
													key={index}
													onClick={() => {
														if (link.url) {
															const page = parseInt(link.label);
															if (!isNaN(page))
																setCurrentPage(page);
														}
													}}
													disabled={!link.url}
													className={`join-item btn btn-sm ${
														link.active ? 'btn-active' : ''
													} ${!link.url ? 'btn-disabled' : ''}`}
													dangerouslySetInnerHTML={{
														__html: link.label,
													}}
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						)}
						{activeTab === 'writeComment' && (
							<div>
								{/* Comment Form */}
								<div className="mb-4">
									<textarea
										className="w-full p-2 border rounded-md"
										placeholder="Write your comment here..."
										value={newComment}
										onChange={(e) => setNewComment(e.target.value)}
									/>
									<button
										className="btn btn-sm bg-[#40BFFF] text-white mt-2"
										onClick={handleAddComment}
									>
										Submit Comment
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<RelatedProduct id={product.brand_id} productId={product.id} />
			</div>
		</div>
	);
};

export default ProductDetail;
