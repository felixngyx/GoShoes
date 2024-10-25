import Brand from './Brand';
import Size from './Size';

const Variant = () => {
	return (
		<div className="grid grid-cols-2 gap-5">
			<Brand />
			<Size />
		</div>
	);
};

export default Variant;
