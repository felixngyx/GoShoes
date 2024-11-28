import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
	return (
		<div className="w-full bg-[#BCDDFE]">
			{/* Thay đổi padding trên mobile */}
			<div className="container max-w-7xl mx-auto py-6 md:py-10 px-4">
				{/* Top Section - Thêm spacing nhỏ hơn trên mobile */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-6 md:mb-10">
					{/* Logo & Description */}
					<div className="text-center md:text-left">
						<div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
							<div className="rounded-lg p-2">
								<img src="/vector-logo/default-monochrome.svg" className="w-24" alt="Logo" />
							</div>
						</div>
						<p className="text-gray-600 max-w-[300px] mx-auto md:mx-0">
							Goshoes is a website that sells shoes.
						</p>
					</div>

					{/* Follow Us */}
					<div className="text-center md:text-left">
						<h3 className="text-xl font-bold mb-3 md:mb-4">Follow Us</h3>
						<p className="text-gray-600 mb-3 md:mb-4">
							Follow us on social media to get the latest news and updates.
						</p>
						<div className="flex gap-4 justify-center md:justify-start">
							<a href="#" className="text-[#385C8E] hover:opacity-80 transition-opacity">
								<FaFacebookF size={20} />
							</a>
							<a href="#" className="text-[#03A9F4] hover:opacity-80 transition-opacity">
								<FaTwitter size={20} />
							</a>
						</div>
					</div>

					{/* Contact Us */}
					<div className="text-center md:text-left">
						<h3 className="text-xl font-bold mb-3 md:mb-4">Contact Us</h3>
						<div className="text-gray-600">
							<p>Goshoes , 118</p>
							<p>Hai Ba Trung , Ha Noi</p>
							<p>Viet Nam</p>
						</div>
					</div>
				</div>

				{/* Links Section - Cải thiện layout trên mobile */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-10">
					{/* Information */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Information</h3>
						<ul className="space-y-2">
							<li><Link to="/about-us" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">About Us</Link></li>
							<li><Link to="/news" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">News</Link></li>
							<li><Link to="/contact" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Contact</Link></li>
							<li><Link to="/brand" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Brands</Link></li>
						</ul>
					</div>

					{/* Shop */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Shop</h3>
						<ul className="space-y-2">
							<li><Link to="/products" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Products</Link></li>
							<li><Link to="/category" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Categories</Link></li>
							<li><Link to="/cart" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Shopping Cart</Link></li>
						</ul>
					</div>

					{/* My Account */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">My Account</h3>
						<ul className="space-y-2">
							<li><Link to="/account" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Account Info</Link></li>
							<li><Link to="/account/my-order" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">My Orders</Link></li>
							<li><Link to="/account/whish-list" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Wishlist</Link></li>
							<li><Link to="/account/my-address" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">My Addresses</Link></li>
						</ul>
					</div>

					{/* Support */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Support</h3>
						<ul className="space-y-2">
							<li><Link to="/signin" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Sign In</Link></li>
							<li><Link to="/signup" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Sign Up</Link></li>
							<li><Link to="/forget-password" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Forgot Password</Link></li>
						</ul>
					</div>
				</div>

				{/* Bottom Section - Cải thiện spacing và alignment trên mobile */}
				<div className="border-t border-gray-300 pt-4 md:pt-6">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<p className="text-gray-600 text-sm md:text-base text-center md:text-left">
							© 2024 Goshoes. All rights reserved.
						</p>
						<div className="flex gap-4 items-center">
							<img 
								src="https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg" 
								alt="ZaloPay" 
								className="h-6 md:h-8 object-contain" 
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
