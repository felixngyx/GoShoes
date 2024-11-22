type LoadingIconProps = {
	type: 'infinity' | 'spinner' | 'dots' | 'ring' | 'bars' | 'ball';
	size: 'xs' | 'sm' | 'md' | 'lg';
	color:
		| 'primary'
		| 'secondary'
		| 'accent'
		| 'neutral'
		| 'ghost'
		| 'info'
		| 'success'
		| 'warning'
		| 'error';
};

const LoadingIcon = ({
	type = 'spinner',
	size = 'md',
	color = 'info',
}: LoadingIconProps) => {
	return (
		<span
			className={`loading loading-${type} loading-${size} text-${color}`}
		></span>
	);
};

export default LoadingIcon;
