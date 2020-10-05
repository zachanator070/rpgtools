import React, {useEffect, useRef, useState} from 'react';
import {ModelRenderer} from "../../rendering/ModelRenderer";
import {Button, Input} from "antd";


export const ModelViewer = ({model, width, height, defaultColor, showColorControls, onChangeColor}) => {
	const [renderer, setRenderer] = useState();
	const [modelColor, setModelColor] = useState(defaultColor);
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

	useEffect(() => {
		(async () => {
			await setModelColor(defaultColor);
		})();
	}, [defaultColor]);

	useEffect(() => {
		(async () => {
			if(renderer){
				renderer.setModelColor(modelColor);
				if(onChangeColor){
					await onChangeColor(modelColor);
				}
			}
		})();
	}, [renderer, modelColor]);

	return <div className={'margin-md-top'}>

		{showColorControls && <>
			<div>
			<span className={'margin-md-right'}>
				Color:
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
					onClick={async () => {
						await setModelColor(null);
					}}
				>
					Clear Color
				</Button>
			</div>
		</>}

		<div className={'margin-md-top'}>
			<canvas ref={renderCanvas} style={{width: width || 500, height: height || 700}}/>
		</div>
	</div>;
};