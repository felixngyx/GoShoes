import { IoStar } from 'react-icons/io5';

const ProductCard = () => {
	return (
		<div className="col-span-1 border border-gray-[#F6F7F8] rounded-lg">
			<img src="demo.png" alt="Product 1" />
			<p className="text-center text-[#223263] text-xl font-bold mt-2">
				Nike Air Max 270
			</p>
			<div className="flex flex-row items-center justify-center gap-1 mx-auto my-1">
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
				<IoStar color="yellow" />
			</div>
			<div className="flex items-center justify-center gap-2 mb-2">
				<p className="text-[#40BFFF] text-lg font-bold">2.345.000 ₫</p>
				<p className="text-[#9098B1] text-xm font-bold line-through">
					2.345.000 ₫
				</p>
				<p className="text-[#E71D36] text-xm font-bold">-10%</p>
			</div>
		</div>
	);
};

export default ProductCard;
