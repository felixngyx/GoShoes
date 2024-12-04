import React, { useRef } from 'react';

interface ZoomImageProps {
	src: string;
	alt: string;
}

const ZoomImage: React.FC<ZoomImageProps> = ({ src, alt }) => {
	const imageZoomRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (event: React.MouseEvent) => {
		if (imageZoomRef.current) {
			const imageZoom = imageZoomRef.current;
			const rect = imageZoom.getBoundingClientRect();
			const pointer = {
				x: ((event.clientX - rect.left) * 100) / rect.width,
				y: ((event.clientY - rect.top) * 100) / rect.height,
			};
			imageZoom.style.setProperty('--zoom-x', pointer.x + '%');
			imageZoom.style.setProperty('--zoom-y', pointer.y + '%');
			imageZoom.style.setProperty('--display', 'block');
		}
	};

	const handleMouseOut = () => {
		if (imageZoomRef.current) {
			imageZoomRef.current.style.setProperty('--display', 'none');
		}
	};

	return (
		<div
			id="imageZoom"
			ref={imageZoomRef}
			style={
				{
					'--url': `url(${src})`,
					'--zoom-x': '0%',
					'--zoom-y': '0%',
					'--display': 'none',
					width: '100%',
					height: '100%',
					position: 'relative',
					pointerEvents: 'auto',
				} as React.CSSProperties
			}
			onMouseMove={handleMouseMove}
			onMouseOut={handleMouseOut}
		>
			<img
				src={src}
				alt={alt}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: '0 0',
				}}
			/>
			<style>
				{`
					#imageZoom::after {
						display: var(--display);
						content: '';
						width: 100%;
						height: 100%;
						background-color: black;
						background-image: var(--url);
						background-size: 200%;
						background-position: var(--zoom-x) var(--zoom-y);
						position: absolute;
						left: 0;
						top: 0;
					}
				`}
			</style>
		</div>
	);
};

export default ZoomImage;
