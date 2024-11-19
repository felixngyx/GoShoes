import { FaFacebookF, FaTwitter } from 'react-icons/fa';

const Footer = () => {
	return (
		<div className="w-full bg-[#BCDDFE]">
			<div className="container max-w-7xl mx-auto py-10 px-4">
				{/* Top Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
					{/* Logo & Description */}
					<div>
						<div className="flex items-center gap-2 mb-4">
							<div className="bg-blue-500 rounded-lg p-2">
								<div className="w-6 h-6 bg-white rounded-lg"></div>
							</div>
							<span className="text-xl font-bold">Goshoes</span>
						</div>
						<p className="text-gray-600 max-w-[300px]">
							Goshoes is a website that sells shoes.
						</p>
					</div>

					{/* Follow Us */}
					<div>
						<h3 className="text-xl font-bold mb-4">Follow Us</h3>
						<p className="text-gray-600 mb-4">
							Follow us on social media to get the latest news and updates.
						</p>
						<div className="flex gap-4">
							<a href="#" className="text-[#385C8E]">
								<FaFacebookF size={20} />
							</a>
							<a href="#" className="text-[#03A9F4]">
								<FaTwitter size={20} />
							</a>
						</div>
					</div>

					{/* Contact Us */}
					<div>
						<h3 className="text-xl font-bold mb-4">Contact Us</h3>
						<div className="text-gray-600">
							<p>Goshoes , 118</p>
							<p>Hai Ba Trung , Ha Noi</p>
							<p>Viet Nam</p>
						</div>
					</div>
				</div>

				{/* Links Section */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
					{/* Information */}
					<div>
						<h3 className="font-bold mb-4">Information</h3>
						<ul className="space-y-2">
							<li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Information</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
						</ul>
					</div>

					{/* Service */}
					<div>
						<h3 className="font-bold mb-4">Service</h3>
						<ul className="space-y-2">
							<li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Information</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
						</ul>
					</div>

					{/* My Account */}
					<div>
						<h3 className="font-bold mb-4">My Account</h3>
						<ul className="space-y-2">
							<li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Information</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
						</ul>
					</div>

					{/* Our Offers */}
					<div>
						<h3 className="font-bold mb-4">Our Offers</h3>
						<ul className="space-y-2">
							<li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Information</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
							<li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
						</ul>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-gray-300 pt-6">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-600 mb-4 md:mb-0">
							© 2024 Goshoes
						</p>
						<div className="flex gap-4 items-center">
							<img 
								src="https://simg.zalopay.com.vn/zlp-website/assets/new_logo_6c5db2d21b.svg" 
								alt="ZaloPay" 
								className="h-8 object-contain" 
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
