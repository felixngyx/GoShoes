import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
	return (
		<div className="w-full bg-[#BCDDFE]">
			{/* Thay đổi padding trên mobile */}
			<div className="container max-w-7xl mx-auto py-6 md:py-10 px-4">
				{/* Phần trên - Thêm khoảng cách nhỏ hơn trên mobile */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-6 md:mb-10">
					{/* Logo & Mô tả */}
					<div className="text-center md:text-left">
						<div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
							<div className="rounded-lg p-2">
								<img src="/vector-logo/default-monochrome.svg" className="w-24" alt="Logo" />
							</div>
						</div>
						<p className="text-gray-600 max-w-[300px] mx-auto md:mx-0">
							Goshoes là một trang web bán giày.
						</p>
					</div>

					{/* Theo dõi chúng tôi */}
					<div className="text-center md:text-left">
						<h3 className="text-xl font-bold mb-3 md:mb-4">Theo dõi chúng tôi</h3>
						<p className="text-gray-600 mb-3 md:mb-4">
							Theo dõi chúng tôi trên mạng xã hội để nhận tin tức và cập nhật mới nhất.
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

					{/* Liên hệ với chúng tôi */}
					<div className="text-center md:text-left">
						<h3 className="text-xl font-bold mb-3 md:mb-4">Liên hệ với chúng tôi</h3>
						<div className="text-gray-600">
							<p>Goshoes , 118</p>
							<p>Hai Bà Trưng , Hà Nội</p>
							<p>Việt Nam</p>
						</div>
					</div>
				</div>

				{/* Phần liên kết - Cải thiện bố cục trên mobile */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-10">
					{/* Thông tin */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Thông tin</h3>
						<ul className="space-y-2">
							<li><Link to="/about-us" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Về chúng tôi</Link></li>
							<li><Link to="/news" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Tin tức</Link></li>
							<li><Link to="/contact" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Liên hệ</Link></li>
							<li><Link to="/brand" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Thương hiệu</Link></li>
						</ul>
					</div>

					{/* Cửa hàng */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Cửa hàng</h3>
						<ul className="space-y-2">
							<li><Link to="/products" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Sản phẩm</Link></li>
							<li><Link to="/category" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Danh mục</Link></li>
							<li><Link to="/cart" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Giỏ hàng</Link></li>
						</ul>
					</div>

					{/* Tài khoản của tôi */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Tài khoản của tôi</h3>
						<ul className="space-y-2">
							<li><Link to="/account" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Thông tin tài khoản</Link></li>
							<li><Link to="/account/my-order" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Đơn hàng của tôi</Link></li>
							<li><Link to="/account/whish-list" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Danh sách yêu thích</Link></li>
							<li><Link to="/account/my-address" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Địa chỉ của tôi</Link></li>
						</ul>
					</div>

					{/* Hỗ trợ */}
					<div className="text-center md:text-left">
						<h3 className="font-bold mb-3 md:mb-4">Hỗ trợ</h3>
						<ul className="space-y-2">
							<li><Link to="/signin" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Đăng nhập</Link></li>
							<li><Link to="/signup" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Đăng ký</Link></li>
							<li><Link to="/forget-password" className="text-gray-600 hover:text-gray-800 text-sm md:text-base">Quên mật khẩu</Link></li>
						</ul>
					</div>
				</div>

				{/* Phần dưới - Cải thiện khoảng cách và căn chỉnh trên mobile */}
				<div className="border-t border-gray-300 pt-4 md:pt-6">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<p className="text-gray-600 text-sm md:text-base text-center md:text-left">
							© 2024 Goshoes. Bản quyền thuộc về.
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
