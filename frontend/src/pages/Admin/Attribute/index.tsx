import Brand from './Brand';
import Size from './Size';
import Category from './Category';
import Color from './Color';
import PostCategory from './PostCategory';
const Attribute = () => {
	return (
		<div className="grid grid-cols-2 gap-5">
			<Brand />
			<Size />
			<Category />
			<Color />
			<PostCategory />
		</div>
	);
};

export default Attribute;
