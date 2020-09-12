import React, {useEffect, useRef, useState} from 'react';
import {ModelRenderer} from "../../rendering/ModelRenderer";


export const ModelViewer = ({model}) => {
	const [renderer, setRenderer] = useState();

	const renderCanvas = useRef();

	useEffect(() => {
		(async () => {
			await setRenderer(
				new ModelRenderer(
					renderCanvas.current,
					model.depth,
					model.width,
					model.height,
					() => {}
				)
			);
		})();
	}, []);

	useEffect(() => {
		if(renderer && model){
			renderer.modelDepth = model.depth;
			renderer.modelWidth = model.width;
			renderer.modelHeight = model.height;
			renderer.setModel(`/models/${model.fileId}`);
		}
	}, [renderer, model]);

	return <canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>;
};