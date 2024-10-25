import Brand from './Brand';
import Size from './Size';
import Color from './Color';
const Variant = () => {
	return (
		<div className="grid grid-cols-2 gap-5">
			<Brand />
			<Size />
			<Color />
		</div>
	);
};

export default Variant;
