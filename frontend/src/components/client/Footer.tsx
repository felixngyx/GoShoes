import { FaFacebookF, FaTwitter } from 'react-icons/fa';

const Footer = () => {
	return (
		<div className="w-full bg-[#BCDDFE]">
			<div className="container max-w-7xl mx-auto mt-20 py-10">
				<div className="grid grid-cols-3 gap-10">
					<ul className="col-span-1">
						<li className="mb-5">
							<img
								src="vector-logo/default-monochrome.svg"
								className="w-20"
								alt="logo"
							/>
						</li>
						<li className="text-black max-w-[200px]">
							Lorem, ipsum dolor sit amet consectetur adipisicing elit.
							Dicta nobis ducimus asperiores error eius natus.
						</li>
					</ul>
					<ul className="col-span-1">
						<li className="mb-5">
							<p className="text-black text-xl font-bold">Follow Us</p>
						</li>
						<li className="text-black max-w-[200px]">
							Lorem, ipsum dolor sit amet consectetur adipisicing elit.
							Dicta nobis ducimus asperiores error eius natus.
						</li>
						<li className="flex flex-row gap-5 mt-5">
							<FaFacebookF size={20} color="#385C8E" />
							<FaTwitter size={20} color="#03A9F4" />
						</li>
					</ul>
					<ul className="col-span-1">
						<li className="mb-5">
							<p className="text-black text-xl font-bold">Contact Us</p>
						</li>
						<li className="text-black max-w-[200px]">
							<p>Email: info@goshoes.com</p>
							<p>Phone: +62 81234567890</p>
							<p>Address: Jl. Imam Bonjol, Jakarta, Indonesia</p>
						</li>
					</ul>
				</div>
				<div className="bg-white h-[1px] w-full mt-10" />
				<div className="flex flex-row justify-between mt-5">
					<p className="text-black">
						© 2024 GoShoes. All rights reserved.
					</p>
					<p className="text-black">Privacy Policy</p>
				</div>
			</div>
		</div>
	);
};

export default Footer;
