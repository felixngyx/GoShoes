import { IoHeartOutline, IoStar, IoCart } from 'react-icons/io5';
import { Link } from 'react-router-dom';

const ProductCard = () => {
	return (
		<div className="col-span-1 border border-gray-[#F6F7F8] rounded-lg group overflow-hidden">
			<div className="relative">
				<img src="demo.png" alt="Product 1" />
				<div className="absolute hidden group-hover:flex w-[90%] h-[90%] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white justify-center items-center gap-2 z-1">
					<IoHeartOutline
						className="cursor-pointer"
						size={30}
						color="#40BFFF"
					/>
					<IoCart className="cursor-pointer" size={30} color="#40BFFF" />
				</div>
				<div className="absolute top-0 left-0 text-white font-semibold bg-red-500 px-2 ">
					HOT
				</div>
			</div>
			<Link to={`/products/1`}>
				<p className="text-center text-[#223263] text-xl font-bold mt-2">
					Nike Air Max 270
				</p>
			</Link>
			<div className="flex flex-row items-center justify-center gap-1 mx-auto my-1">
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
			</div>
			<div className="flex items-center justify-center gap-2 mb-2">
				<p className="text-primary text-lg font-bold">2.345.000 ₫</p>
				<p className="text-[#9098B1] text-xm font-bold line-through">
					2.345.000 ₫
				</p>
				<p className="text-[#E71D36] text-xm font-bold">-10%</p>
			</div>
		</div>
	);
};

export default ProductCard;
