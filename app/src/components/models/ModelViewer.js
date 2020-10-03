import React, {useEffect, useRef, useState} from 'react';
import {ModelRenderer} from "../../rendering/ModelRenderer";
import {Button, Input} from "antd";


export const ModelViewer = ({model}) => {
	const [renderer, setRenderer] = useState();
	const [modelColor, setModelColor] = useState();
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
			renderer.setModel(`/models/${model.fileName}`);
		}
	}, [renderer, model]);

	return <>
		<div className={'margin-md'}>
			Select Color:
		</div>
		<Input
			type={'color'}
			value={modelColor}
			onChange={async (e) => {
				const value = e.target.value;
				await setModelColor(value);
			}}
		/>
		<Button
			className={'margin-md'}
			onClick={() => {
				renderer.setModelColor(modelColor);
			}}
		>
			Set Color
		</Button>
		<Button
			className={'margin-md'}
			onClick={() => {
				renderer.setModelColor(null);
			}}
		>
			Clear Color
		</Button>
		<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
	</>;
};