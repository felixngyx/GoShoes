const Banner = () => {
	return (
		<div className="h-[290px] w-full bg-[#40BFFF] flex flex-col justify-center items-start px-10 relative">
			<p className="text-white text-3xl font-bold text-left">
				Adidas Men Running <br /> Sneakers
			</p>
			<p className="text-white text-center text-sm mt-1">
				Performance and design. Taken right to the edge.
			</p>

			<p className="text-white text-md font-semibold underline mt-5 text-left cursor-pointer">
				SHOP NOW
			</p>
			<img
				src="images/Banner 4.png"
				className="absolute bottom-[20px] right-20 w-[400px]"
				alt=""
			/>
		</div>
	);
};

export default Banner;
