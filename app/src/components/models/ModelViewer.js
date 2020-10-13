import React, {useEffect, useRef, useState} from 'react';
import {ModelRenderer} from "../../rendering/ModelRenderer";
import {Button, Input} from "antd";
import {LoadingView} from "../LoadingView";


export const ModelViewer = ({model, width, height, defaultColor, showColorControls, onChangeColor}) => {
	const [renderer, setRenderer] = useState();
	const [modelColor, setModelColor] = useState(defaultColor);
	const renderCanvas = useRef();
	const [modelLoading, setModelLoading] = useState(true);

	const defaultWidth = 500;
	const defaultHeight = 700;

	useEffect(() => {
		(async () => {
			await setRenderer(
				new ModelRenderer(
					renderCanvas.current,
					model.depth,
					model.width,
					model.height,
					(loading) => {setModelLoading(loading)}
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
			{modelLoading &&
				<div
					style={{
						width: width || defaultWidth,
						height: height || defaultHeight,
						backgroundColor: 'rgba(140,140,140,0.4)',
						position: 'absolute',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center'
					}}
			     >
				<div
					style={{
						backgroundColor: 'white',
						borderRadius: '10px',
						padding: '10px',
					}}
				>
					<LoadingView/> Loading Model ...
				</div>
				</div>
			}
			<canvas ref={renderCanvas} style={{width: width || defaultWidth, height: height || defaultHeight}}/>
		</div>
	</div>;
};