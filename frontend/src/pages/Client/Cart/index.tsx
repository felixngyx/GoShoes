/* eslint-disable */
import { useState, useEffect } from 'react';
import {
	FiTrash2,
	FiMinus,
	FiPlus,
	FiShoppingBag,
	FiCreditCard,
	FiTruck,
	FiX,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
	const [cartItems, setCartItems] = useState([
		{
			id: 1,
			name: 'Premium Wireless Headphones',
			price: 199.99,
			quantity: 1,
			image: 'images.unsplash.com/photo-1505740420928-5e560c06d30e',
			selected: false,
			description:
				'High-quality wireless headphones with noise cancellation',
			color: 'Black',
		},
		{
			id: 2,
			name: 'Smart Fitness Watch',
			price: 299.99,
			quantity: 1,
			image: 'images.unsplash.com/photo-1523275335684-37898b6baf30',
			selected: false,
			description: 'Advanced fitness tracking with heart rate monitoring',
			color: 'Silver',
		},
		{
			id: 3,
			name: 'Ultra HD Camera',
			price: 599.99,
			quantity: 1,
			image: 'images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
			selected: false,
			description: 'Professional-grade camera with 4K video capability',
			color: 'Black/Silver',
		},
	]);

	const [error, setError] = useState('');
	const [orderSummary, setOrderSummary] = useState({
		subtotal: 0,
		shipping: 15.99,
		tax: 0,
		total: 0,
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [userInfo, setUserInfo] = useState({
		name: '',
		email: '',
		address: '',
	});

	const calculateSubtotal = (item: any) => {
		return item.price * item.quantity;
	};

	const calculateTotal = () => {
		const subtotal = cartItems.reduce(
			(total, item) => total + calculateSubtotal(item),
			0
		);
		const tax = subtotal * 0.1; // 10% tax
		return {
			subtotal,
			tax,
			total: subtotal + tax + orderSummary.shipping,
		};
	};

	useEffect(() => {
		const totals = calculateTotal();
		setOrderSummary((prev) => ({
			...prev,
			...totals,
		}));
	}, [cartItems]);

	const handleQuantityChange = (id: number, newQuantity: number) => {
		setCartItems((prevItems) =>
			prevItems.map((item) => {
				if (item.id === id) {
					if (newQuantity < 1) {
						setError('Quantity cannot be less than 1');
						return item;
					}
					setError('');
					return { ...item, quantity: newQuantity };
				}
				return item;
			})
		);
	};

	const toggleSelectItem = (id: number) => {
		setCartItems((prevItems) =>
			prevItems.map((item) =>
				item.id === id ? { ...item, selected: !item.selected } : item
			)
		);
	};

	const toggleSelectAll = () => {
		const allSelected = cartItems.every((item) => item.selected);
		setCartItems((prevItems) =>
			prevItems.map((item) => ({ ...item, selected: !allSelected }))
		);
	};

	const removeSelectedItems = () => {
		setCartItems((prevItems) => prevItems.filter((item) => !item.selected));
		setError('');
	};

	const removeItem = (id: number) => {
		setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
		setError('');
	};

	const selectedCount = cartItems.filter((item) => item.selected).length;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setUserInfo((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="max-w-7xl mx-auto lg:px-0 sm:px-6">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
						<div className="px-4 py-5 sm:p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-3xl font-bold text-gray-900">
									Shopping Cart
								</h2>
								{cartItems.length > 0 && (
									<div className="flex items-center space-x-4">
										<label className="flex items-center space-x-2 cursor-pointer">
											<input
												type="checkbox"
												checked={
													cartItems.length > 0 &&
													cartItems.every((item) => item.selected)
												}
												onChange={toggleSelectAll}
												className="checkbox checkbox-sm checkbox-primary rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
											/>
											<span className="text-sm text-gray-600">
												Select All
											</span>
										</label>
										{selectedCount > 0 && (
											<button
												onClick={removeSelectedItems}
												className="text-red-600 hover:text-red-800 focus:outline-none focus:underline flex items-center"
												aria-label="Remove selected items"
											>
												<FiTrash2 className="w-5 h-5 mr-1" />
												Remove Selected ({selectedCount})
											</button>
										)}
									</div>
								)}
							</div>

							{error && (
								<motion.div
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
									role="alert"
								>
									<span className="block sm:inline">{error}</span>
								</motion.div>
							)}

							<div className="space-y-4">
								<AnimatePresence>
									{cartItems.map((item) => (
										<motion.div
											key={item.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											className={`flex items-center space-x-4 p-6 rounded-lg ${
												item.selected
													? 'bg-indigo-50'
													: 'bg-gray-50'
											}`}
										>
											<input
												type="checkbox"
												checked={item.selected}
												onChange={() => toggleSelectItem(item.id)}
												className="checkbox checkbox-sm checkbox-primary rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
											/>
											<img
												src={`https://${item.image}`}
												alt={item.name}
												className="w-32 h-32 object-cover rounded"
											/>
											<div className="flex-1">
												<h3 className="text-xl font-medium text-gray-900">
													{item.name}
												</h3>
												<p className="text-gray-500 mt-1">
													{item.description}
												</p>
												<div className="mt-2 space-y-1">
													<p className="text-sm text-gray-600">
														Color: {item.color}
													</p>
												</div>
												<div className="flex items-center space-x-2 mt-4">
													<button
														onClick={() =>
															handleQuantityChange(
																item.id,
																item.quantity - 1
															)
														}
														className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														aria-label="Decrease quantity"
													>
														<FiMinus className="w-5 h-5 text-gray-600" />
													</button>
													<input
														type="number"
														value={item.quantity}
														onChange={(e) =>
															handleQuantityChange(
																item.id,
																parseInt(e.target.value)
															)
														}
														className="w-16 text-center border-gray-300 rounded-md"
														min="1"
														aria-label="Item quantity"
													/>
													<button
														onClick={() =>
															handleQuantityChange(
																item.id,
																item.quantity + 1
															)
														}
														className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														aria-label="Increase quantity"
													>
														<FiPlus className="w-5 h-5 text-gray-600" />
													</button>
												</div>
											</div>
											<div className="text-right">
												<p className="text-2xl font-medium text-gray-900">
													${calculateSubtotal(item).toFixed(2)}
												</p>
												<button
													onClick={() => removeItem(item.id)}
													className="mt-4 text-red-600 hover:text-red-800 focus:outline-none focus:underline flex items-center justify-end"
													aria-label={`Remove ${item.name} from cart`}
												>
													<FiTrash2 className="w-5 h-5 mr-1" />
													Remove
												</button>
											</div>
										</motion.div>
									))}
								</AnimatePresence>
							</div>

							{cartItems.length === 0 && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-center py-12"
								>
									<FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
									<h3 className="text-xl font-medium text-gray-900 mb-2">
										Your cart is empty
									</h3>
									<p className="text-gray-500">
										Start shopping to add items to your cart
									</p>
								</motion.div>
							)}
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg shadow-lg p-6 sticky top-8 border border-gray-200">
						<h3 className="text-xl font-bold text-gray-900 mb-6">
							Order Summary
						</h3>
						<div className="space-y-4">
							<div className="flex justify-between">
								<span className="text-gray-600">Subtotal</span>
								<span className="text-gray-900">
									${orderSummary.subtotal.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Shipping</span>
								<span className="text-gray-900">
									${orderSummary.shipping.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Tax (10%)</span>
								<span className="text-gray-900">
									${orderSummary.tax.toFixed(2)}
								</span>
							</div>
							<div className="border-t pt-4">
								<div className="flex justify-between">
									<span className="text-lg font-bold text-gray-900">
										Total
									</span>
									<span className="text-2xl font-bold text-gray-900">
										${orderSummary.total.toFixed(2)}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex items-center text-green-600">
									<FiTruck className="w-5 h-5 mr-2" />
									<span>Free shipping on orders over $100</span>
								</div>
								<div className="flex items-center text-blue-600">
									<FiCreditCard className="w-5 h-5 mr-2" />
									<span>Secure payment processing</span>
								</div>
							</div>

							<button
								className="mt-6 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								onClick={() => setIsModalOpen(true)}
								aria-label="Proceed to checkout"
								disabled={cartItems.length === 0}
							>
								Proceed to Checkout
							</button>
						</div>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<AnimatePresence>
					{isModalOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 overflow-y-auto"
						>
							<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
								{/* <div
									className="fixed inset-0 transition-opacity z-40"
									aria-hidden="true"
								>
									<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
								</div> */}
								<motion.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.95, opacity: 0 }}
									className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50 border border-gray-200"
								>
									<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
										<div className="flex justify-between items-center mb-4">
											<h3 className="text-lg font-medium leading-6 text-gray-900">
												Checkout Information
											</h3>
											<button
												onClick={() => setIsModalOpen(false)}
												className="text-gray-400 hover:text-gray-500"
											>
												<FiX className="h-6 w-6" />
											</button>
										</div>
										<form className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">
														First Name
													</label>
													<input
														type="text"
														name="firstName"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
														onChange={handleInputChange}
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Last Name
													</label>
													<input
														type="text"
														name="lastName"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
														onChange={handleInputChange}
													/>
												</div>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Email
												</label>
												<input
													type="email"
													name="email"
													required
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
													onChange={handleInputChange}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Address
												</label>
												<input
													type="text"
													name="address"
													required
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
													onChange={handleInputChange}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">
														City
													</label>
													<input
														type="text"
														name="city"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
														onChange={handleInputChange}
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">
														ZIP Code
													</label>
													<input
														type="text"
														name="zipCode"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
														onChange={handleInputChange}
													/>
												</div>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Card Number
												</label>
												<input
													type="text"
													name="cardNumber"
													required
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
													onChange={handleInputChange}
													maxLength={16}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Expiry Date
													</label>
													<input
														type="text"
														name="expiryDate"
														placeholder="MM/YY"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700">
														CVV
													</label>
													<input
														type="text"
														name="cvv"
														required
														className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
														onChange={handleInputChange}
														maxLength={3}
													/>
												</div>
											</div>
											<div className="mt-5 sm:mt-6">
												<button
													type="submit"
													className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
												>
													Complete Purchase ($
													{orderSummary.total.toFixed(2)})
												</button>
											</div>
										</form>
									</div>
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	);
};

export default Cart;
