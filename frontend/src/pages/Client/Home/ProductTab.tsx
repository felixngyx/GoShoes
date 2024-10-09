import ProductCard from './ProductCard';

type ProductTabProps = {
	ariaLabel: string;
	defaultChecked?: boolean;
};

const ProductTab = ({ ariaLabel, defaultChecked = false }: ProductTabProps) => {
	return (
		<>
			<input
				type="radio"
				name="my_tabs_1"
				role="tab"
				className="tab mx-10"
				aria-label={ariaLabel}
				defaultChecked={defaultChecked}
			/>
			<div role="tabpanel" className="tab-content mt-10">
				<div className="grid grid-cols-4 gap-10">
					{Array(8)
						.fill(null)
						.map((_, index) => (
							<ProductCard key={index} />
						))}
				</div>
				<p className="text-center text-[#40BFFF] cursor-pointer underline text-xl font-bold mt-10">
					Load More
				</p>
			</div>
		</>
	);
};

export default ProductTab;
