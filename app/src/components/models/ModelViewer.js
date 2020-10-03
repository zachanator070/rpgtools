import React, {useEffect, useRef, useState} from 'react';
import {ModelRenderer} from "../../rendering/ModelRenderer";
import {Button, Input} from "antd";


export const ModelViewer = ({model, width, height}) => {
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

	return <div className={'margin-md-top'}>
		<div>
			<span className={'margin-md-right'}>
			Select Color:
		</span>
			<Input
				style={{
					width: '100px'
				}}
				type={'color'}
				value={modelColor}
				onChange={async (e) => {
					const value = e.target.value;
					await setModelColor(value);
				}}
			/>
		</div>

		<div className={'margin-md-top'}>
			<Button
				className={'margin-md-right'}
				onClick={() => {
					renderer.setModelColor(modelColor);
				}}
			>
				Set Color
			</Button>
			<Button
				onClick={() => {
					renderer.setModelColor(null);
				}}
			>
				Clear Color
			</Button>
		</div>
		<div className={'margin-md-top'}>
			<canvas ref={renderCanvas} style={{width: width || 500, height: height || 700}}/>
		</div>
	</div>;
};