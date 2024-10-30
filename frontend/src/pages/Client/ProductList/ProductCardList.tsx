import { Heart, ShoppingCart } from 'lucide-react';

const ProductCardList = () => {
	return (
		<>
			<div className="flex flex-row gap-5">
				<div className="w-1/3">
					<img src="images/image.png" alt="" />
				</div>
				<div className="w-2/3">
					<div className="flex flex-col justify-between items-start h-full gap-2 p-2">
						<h3 className="text-2xl font-semibold">Nike Air Max 200</h3>
						<div className="flex flex-row gap-2 items-center">
							<div className="rating flex flex-row items-center gap-1">
								<input
									type="radio"
									name="rating-2"
									className="mask mask-star-2 w-4 bg-yellow-400"
								/>
								<input
									type="radio"
									name="rating-2"
									className="mask mask-star-2 w-4 bg-yellow-400"
									defaultChecked
								/>
								<input
									type="radio"
									name="rating-2"
									className="mask mask-star-2 w-4 bg-yellow-400"
								/>
								<input
									type="radio"
									name="rating-2"
									className="mask mask-star-2 w-4 bg-yellow-400"
								/>
								<input
									type="radio"
									name="rating-2"
									className="mask mask-star-2 w-4 bg-yellow-400"
								/>
							</div>
							<p className="text-sm text-[#C1C8CE]">12 reviews</p>
						</div>
						<hr className="w-2/3" />
						<div className="flex flex-row gap-2 items-center">
							<p className="text-xl font-semibold text-[#40BFFF]">
								2.345.000₫
							</p>
							<p className="text-sm line-through text-[#C1C8CE]">
								2.500.000₫
							</p>
							<p className="text-sm text-[#FF4242] font-semibold">
								-6% Off
							</p>
						</div>
						<p>
							Lorem ipsum dolor sit amet consectetur adipisicing elit.
							Libero, odio minus deserunt voluptatem voluptate doloribus
							sunt totam quam vero perspiciatis explicabo quaerat
							tenetur. Natus aperiam ullam deleniti commodi! Tempore,
							dolorem.
						</p>
						<div className="flex flex-row gap-2">
							<button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] px-10 flex flex-row gap-2 items-center">
								<ShoppingCart /> Add to cart
							</button>
							<button className="btn bg-[#ebf6ff] rounded-sm text-[#40BFFF] hover:bg-[#40BFFF] hover:text-[#fff] flex flex-row gap-2 items-center">
								<Heart />
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ProductCardList;
