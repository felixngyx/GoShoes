import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { IoStar, IoPricetag, IoAirplaneOutline, IoStatsChartOutline, IoStorefrontOutline } from 'react-icons/io5';
import ProductCard from '../ProductCard';

type Product = {
	image: string;
	name: string;
	category: string;
	price: number;
	sold: number;
	profit: number;
	colors: string[];
	sizes: string[];
};

const ProductDetail = () => {
	const product: Product = {
		image: '/src/images/product/product-02.png',
		name: 'Nike Air Max 200',
		category: 'Running Shoes',
		price: 2345000,
		sold: 1500,
		profit: 450000000,
		colors: ['#FF0000', '#00FF00', '#0000FF'], // Màu sắc sản phẩm
		sizes: ['39', '40', '41'], // Kích thước sản phẩm
	};

	const [selectedColor, setSelectedColor] = useState(product.colors[0]); // Màu đã chọn
	const [selectedSize, setSelectedSize] = useState(product.sizes[0]); // Kích thước đã chọn

	const calculateRating = (sold: number, profit: number) => {
		const avgProfit = profit / sold; // Tính lợi nhuận trung bình
		return Math.min(Math.round((avgProfit / 300000) * 5), 5); // Tính xếp hạng
	};

	const rating = calculateRating(product.sold, product.profit); // Lấy xếp hạng

	return (
		
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col lg:flex-row gap-5">
				<div className="lg:w-1/3">
					<img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
				</div>
				<div className="lg:w-2/3">
					<div className="flex flex-col justify-between items-start h-full gap-2 p-2">
						<h1 className="text-3xl font-semibold">{product.name}</h1>
						<p className="text-lg text-gray-600">{product.category}</p>
						<div className="flex flex-row gap-2 items-center">
							<div className="rating flex flex-row items-center gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<IoStar key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-400'} size={20} />
								))}
							</div>
							<p className="text-sm text-[#C1C8CE]">{product.sold} sold</p>
						</div>
						<hr className="w-2/3 my-2" />
						<div className="flex flex-row gap-2 items-center">
							<p className="text-xl font-semibold text-[#40BFFF]">
								{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
							</p>
							<p className="text-sm line-through text-[#C1C8CE]">
								{(product.price * 1.06).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
							</p>
							<p className="text-sm text-[#FF4242] font-semibold">-6% Off</p>
						</div>
						<p className="text-base text-gray-600 my-4">
							{product.name} is a perfect combination of style and performance. Designed specifically for {product.category.toLowerCase()}, these shoes provide maximum comfort and support for every step of your run.
						</p>

						{/* Chọn màu */}
						<div>
							<h2 className="text-lg font-semibold">Choose Color:</h2>
							<div className="flex gap-2 mt-2">
								{product.colors.map((color) => (
									<div
										key={color}
										className={`w-8 h-8 rounded-full border-2 cursor-pointer ${selectedColor === color ? 'border-black' : 'border-transparent'}`}
										style={{ backgroundColor: color }}
										onClick={() => setSelectedColor(color)} // Chọn màu
									/>
								))}
							</div>
						</div>

						{/* Chọn kích thước */}
						<div className="mt-4">
							<h2 className="text-lg font-semibold">Choose Size:</h2>
							<select
								value={selectedSize}
								onChange={(e) => setSelectedSize(e.target.value)} // Thay đổi kích thước
								className="mt-2 p-2 border border-gray-300 rounded"
							>
								{product.sizes.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</select>
						</div>

						<div className="flex flex-row gap-2 mt-4">
							<button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] px-10 flex flex-row gap-2 items-center">
								<ShoppingCart /> Add to Cart
							</button>
							<button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] flex flex-row gap-2 items-center">
								<Heart />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Thông tin chi tiết sản phẩm */}
			<div className="mt-12">
				<h2 className="text-2xl font-semibold mb-4">
					<IoStorefrontOutline className="inline-block mr-2" /> Product Details
				</h2>
				<p className="text-gray-600">
					{product.name} is a top choice for {product.category.toLowerCase()} enthusiasts. With advanced cushioning technology and breathable materials, these shoes provide maximum comfort for both high-intensity workouts and everyday wear.
				</p>
			</div>

			{/* Thông số kỹ thuật */}
			<div className="mt-8">
				<h2 className="text-2xl font-semibold mb-4">
					<IoPricetag className="inline-block mr-2" /> Specifications
				</h2>
				<ul className="list-disc list-inside text-gray-600">
					<li>Category: {product.category}</li>
					<li>Price: {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</li>
					<li>Sold: {product.sold}</li>
					<li>Rating: {rating}/5 stars</li>
					<li>Color: As shown</li>
					<li>Origin: Imported</li>
				</ul>
			</div>

			{/* Thông tin bán hàng */}
			<div className="mt-8">
				<h2 className="text-2xl font-semibold mb-4">
					<IoStatsChartOutline className="inline-block mr-2" /> Sales Information
				</h2>
				<p className="text-gray-600">
					{product.name} is one of the best-selling products in our {product.category.toLowerCase()} category, with {product.sold} units sold. Its popularity has significantly contributed to the store's revenue.
				</p>
			</div>

			{/* Thông tin giao hàng */}
			<div className="mt-8">
				<h2 className="text-2xl font-semibold mb-4">
					<IoAirplaneOutline className="inline-block mr-2" /> Shipping Information
				</h2>
				<p className="text-gray-600">
					Free standard shipping for orders over 1,000,000₫. Estimated delivery time: 3-5 business days.
				</p>
			</div>

			{/* Phần gợi ý sản phẩm */}
			<div className="mt-12">
				<h2 className="text-2xl font-semibold mb-4">You Might Also Like</h2>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> {/* Thay đổi thành grid với các cột khác nhau cho các kích thước màn hình khác nhau */}
					{/* Các sản phẩm gợi ý */}
					{[1, 2, 3, 4].map((_, index) => (
						<div key={index} className="flex-none"> {/* Để thẻ div tự động điều chỉnh kích thước */}
							<ProductCard />
						</div>
					))}
				</div>
			</div>

		</div>
	);
};

export default ProductDetail;
