import React, {Component, useRef, useState, useEffect} from 'react';

export const ScaledImage = ({src, width: propWidth, height: propHeight}) => {

	const scaledImage = useRef();
	const [width, setWidth] = useState(propWidth);
	const [height, setHeight] = useState(propHeight);

	const resize = () => {
		if (!propWidth || !propHeight || !scaledImage.current) {
			return;
		}
		const currentHeight = scaledImage.current.naturalHeight;
		const currentWidth = scaledImage.current.naturalWidth;
		const widthScale = propWidth / currentWidth;
		const heightScale = propHeight / currentHeight;
		let biggestScale = widthScale;
		if (heightScale > widthScale) {
			biggestScale = heightScale;
		}
		if (biggestScale > 1) {
			biggestScale = 1;
		}

		setWidth(currentWidth * biggestScale);
		setHeight(currentHeight * biggestScale);
	};

	const onImgLoad = ({target: img}) => {
		resize();
	};

	useEffect(() => {
		resize();
	}, [width, height]);

	return (
		<img alt='' ref={scaledImage} style={{width: width, height: height}}
		     onLoad={onImgLoad} src={src}/>
	);
};
