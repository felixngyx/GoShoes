import Brand from './Brand';
import Size from './Size';
import Category from './Category';
import Color from './Color';
const Attribute = () => {
	return (
		<div className="grid grid-cols-2 gap-5">
			<Brand />
			<Size />
			<Category />
			<Color />
		</div>
	);
};

export default Attribute;
