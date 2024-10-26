import React, { useState } from 'react'
import { ShoppingCart, Heart, Share2 } from 'lucide-react'
import { FaStar, FaFacebookF, FaTwitter } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Breadcrumb from '../../../components/client/Breadcrumb'

interface Product {
	id: string
	name: string
	price: number
	oldPrice: number
	images: string[]
	colors: string[]
	sizes: string[]
	availability: string
	category: string
}

const ProductDetail: React.FC = () => {
	const product: Product = {
		id: '1',
		name: 'Nike Airmax 270 React',
		price: 299.43,
		oldPrice: 534.33,
		images: [
			'/src/images/product/image Product (1).png',
			'/src/images/product/Product Picture03.png',
			'/src/images/product/image Product (2).png',
			'/src/images/product/Product Picture03.png',
		],
		colors: ['#FF0000', '#0000FF', '#000000', '#FFFF00'],
		sizes: ['39', '40', '41', '42'],
		availability: 'In stock',
		category: 'Men shoes',
	}

	const [selectedImage, setSelectedImage] = useState(product.images[0])
	const [selectedColor, setSelectedColor] = useState(product.colors[0])
	const [selectedSize, setSelectedSize] = useState(product.sizes[0])
	const [quantity, setQuantity] = useState(1)
	const [activeTab, setActiveTab] = useState('product-information')

	return (
		<div className="container mx-auto px-4 py-8">
			<Breadcrumb
				items={[
					{ name: 'Home', link: '' },
					{ name: 'ProductDetail', link: 'ProductDetail' },
				]}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<img src={selectedImage} alt={product.name} className="w-full h-auto object-cover rounded-lg mb-4" />
					<div className="flex space-x-2">
						{product.images.map((img, index) => (
							<img
								key={index}
								src={img}
								alt={`${product.name} thumbnail ${index + 1}`}
								className="w-20 h-20 object-cover rounded cursor-pointer"
								onClick={() => setSelectedImage(img)}
							/>
						))}
					</div>
				</div>

				<div>
					<h1 className="text-3xl font-bold mb-2">{product.name}</h1>
					<div className="flex items-center mb-2">
						{[...Array(5)].map((_, i) => (
							<FaStar key={i} className="text-yellow-400" />
						))}
						<span className="ml-2 text-gray-600">(121)</span>
					</div>
					<div className="flex items-center space-x-2 mb-4">
						<span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
						<span className="text-gray-500 line-through">${product.oldPrice.toFixed(2)}</span>
						<span className="text-red-500 font-semibold">24% Off</span>
					</div>
					<p className="mb-4">Availability: <span className="font-semibold">{product.availability}</span></p>
					<p className="mb-4">Category: <span className="font-semibold">{product.category}</span></p>
					<p className="mb-4">Free shipping</p>

					<div className="mb-4">
						<h3 className="font-semibold mb-2">Select Color:</h3>
						<div className="flex space-x-2">
							{product.colors.map((color) => (
								<button
									key={color}
									className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
									style={{ backgroundColor: color }}
									onClick={() => setSelectedColor(color)}
								/>
							))}
						</div>
					</div>

					<div className="mb-4">
						<h3 className="font-semibold mb-2">Size:</h3>
						<select
							value={selectedSize}
							onChange={(e) => setSelectedSize(e.target.value)}
							className="select select-bordered w-full max-w-xs"
						>
							{product.sizes.map((size) => (
								<option key={size} value={size}>{size}</option>
							))}
						</select>
					</div>

					<div className="flex items-center space-x-4 mb-6">
						<div className="flex items-center border rounded-md">
							<button
								className="px-3 py-1 text-xl"
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
							>
								-
							</button>
							<input
								type="number"
								value={quantity}
								onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
								className="w-12 text-center border-none"
							/>
							<button
								className="px-3 py-1 text-xl"
								onClick={() => setQuantity(quantity + 1)}
							>
								+
							</button>
						</div>
						<button className="btn btn-primary">
							<ShoppingCart className="mr-2" />
							Add to Cart
						</button>
						<button className="btn btn-outline">
							<Heart />
						</button>
					</div>

					<div className="flex space-x-2 mb-6">
						<button className="btn btn-outline btn-sm">
							<FaFacebookF className="mr-2" />
							Share on Facebook
						</button>
						<button className="btn btn-outline btn-sm">
							<FaTwitter className="mr-2" />
							Share on Twitter
						</button>
					</div>
				</div>
			</div>

			<div className="mt-12">
				<div className="tabs tabs-boxed mb-4">
					<button
						className={`tab ${activeTab === 'product-information' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('product-information')}
					>
						Product Information
					</button>
					<button
						className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('reviews')}
					>
						Reviews
					</button>
					<button
						className={`tab ${activeTab === 'another-tab' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('another-tab')}
					>
						Another Tab
					</button>
				</div>

				<div className="bg-base-200 p-6 rounded-lg">
					{activeTab === 'product-information' && (
						<p>
							The Nike Air Max 270 React combines two of Nike's most innovative technologies for a shoe that's both comfortable and stylish. The React foam midsole provides responsive cushioning, while the Air Max unit in the heel offers impact protection and a unique look.
						</p>
					)}
					{activeTab === 'reviews' && (
						<p>Customer reviews will be displayed here.</p>
					)}
					{activeTab === 'another-tab' && (
						<p>Additional information can be added here.</p>
					)}
				</div>
			</div>

			<div className="mt-12">
				<h2 className="text-2xl font-bold mb-6">Related Products</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					{[...Array(4)].map((_, index) => (
						<div key={index} className="card bg-base-100 shadow-xl">
							<figure><img src='/src/images/product/image Product (1).png' alt="Shoes" /></figure>
							<div className="card-body">
								<h2 className="card-title">Nike Air Max 270 React</h2>
								<div className="flex items-center">
									{[...Array(5)].map((_, i) => (
										<FaStar key={i} className="text-yellow-400" />
									))}
								</div>
								<p className="text-blue-600 font-bold">$299.43</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default ProductDetail