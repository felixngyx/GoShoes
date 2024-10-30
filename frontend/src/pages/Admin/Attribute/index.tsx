import Brand from './Brand';
import Size from './Size';
import Category from './Category';
const Attribute = () => {
	return (
		<div className="grid grid-cols-2 gap-5">
			<Brand />
			<Size />
			<Category />
		</div>
	);
};

export default Attribute;
