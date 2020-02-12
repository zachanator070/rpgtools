import React, {Component, useRef, useState} from 'react';

export const ScaledImage = ({src, propWidth, propHeight}) => {

	const scaledImage = useRef();
	const [width, setWidth] = useState(propWidth);
	const [height, setHeight] = useState(propHeight);

	const resize = () => {
		if (propWidth === 0 || propHeight === 0 || !scaledImage.content) {
			return;
		}
		const currentHeight = scaledImage.content.naturalHeight;
		const currentWidth = scaledImage.content.naturalWidth;
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
