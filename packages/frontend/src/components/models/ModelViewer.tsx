import React, { useEffect, useRef, useState } from "react";
import { ModelRenderer } from "../../rendering/ModelRenderer";
import LoadingView from "../LoadingView";
import {Model} from "../../types";
import PrimaryButton from "../widgets/PrimaryButton";
import ColorInput from "../widgets/input/ColorInput";

interface ModelViewerProps {
	model: Model;
	width?: number;
	height?: number;
	defaultColor?: string;
	showColorControls?: boolean;
	onChangeColor?: (color: string) => Promise<any>;
}

export default function ModelViewer({
	model,
	width,
	height,
	defaultColor,
	showColorControls,
	onChangeColor,
}: ModelViewerProps) {
	const [renderer, setRenderer] = useState<ModelRenderer>();
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
					(loading) => {
						setModelLoading(loading);
					}
				)
			);
		})();
	}, []);

	useEffect(() => {
		if (renderer && model) {
			renderer.setModelDepth(model.depth);
			renderer.setModelWidth(model.width);
			renderer.setModelHeight(model.height);
			renderer.setModel(model);
		}
	}, [renderer, model]);

	useEffect(() => {
		(async () => {
			await setModelColor(defaultColor);
		})();
	}, [defaultColor]);

	useEffect(() => {
		(async () => {
			if (renderer) {
				renderer.setModelColor(modelColor);
				if (onChangeColor) {
					await onChangeColor(modelColor);
				}
			}
		})();
	}, [renderer, modelColor]);

	return (
		<div className={"margin-md-top"}>
			{showColorControls && (
				<>
					<div>
						<span className={"margin-md-right"}>Color:</span>
						<ColorInput
							style={{
								width: "100px",
							}}
							value={modelColor}
							onChange={async (e) => {
								const value = e.target.value;
								await setModelColor(value);
							}}
						/>
					</div>
					<div className={"margin-md-top"}>
						<PrimaryButton
							onClick={async () => {
								await setModelColor(null);
							}}
						>
							Clear Color
						</PrimaryButton>
					</div>
				</>
			)}

			<div className={"margin-md-top"}>
				{modelLoading && (
					<div
						style={{
							width: width || defaultWidth,
							height: height || defaultHeight,
							backgroundColor: "rgba(140,140,140,0.4)",
							position: "absolute",
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<div
							style={{
								backgroundColor: "white",
								borderRadius: "10px",
								padding: "10px",
							}}
						>
							<LoadingView /> Loading Model ...
						</div>
					</div>
				)}
				<canvas
					ref={renderCanvas}
					style={{
						width: width || defaultWidth,
						height: height || defaultHeight,
					}}
				/>
			</div>
		</div>
	);
};
