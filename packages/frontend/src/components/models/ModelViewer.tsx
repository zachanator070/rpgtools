import React, {Ref, RefObject, useEffect, useRef, useState} from "react";
import { ModelRenderer } from "../../rendering/ModelRenderer";
import LoadingView from "../LoadingView";
import {Model} from "../../types";
import PrimaryButton from "../widgets/PrimaryButton";
import ColorInput from "../widgets/input/ColorInput";

interface ModelViewerProps {
	model: Model;
	defaultColor?: string;
	showColorControls?: boolean;
	onChangeColor?: (color: string) => Promise<any>;
	container?: HTMLElement;
}

export default function ModelViewer({
	model,
	defaultColor,
	showColorControls,
	onChangeColor,
}: ModelViewerProps) {
	const [renderer, setRenderer] = useState<ModelRenderer>();
	const [modelColor, setModelColor] = useState(defaultColor);
	const renderCanvas = useRef();
	const [canvasWidth, setCanvasWidth] = useState(100);
	const [canvasHeight, setCanvasHeight] = useState(75);
	const [modelLoading, setModelLoading] = useState(true);
	const [container, setContainer] = useState<HTMLElement>();

	useEffect(() => {
		(async () => {
			if (container) {
				const observer = new ResizeObserver(() => {
					if (container.offsetWidth !== canvasWidth) {
						setCanvasWidth(container.offsetWidth);
						setCanvasHeight(container.offsetWidth * 3/4);
					}
				});
				observer.observe(container);
				setCanvasWidth(container.offsetWidth);
				setCanvasHeight(container.offsetWidth * 3/4);
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
			}

		})();
	}, [container]);

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
		<div>
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

			<div className={"margin-md-top"} ref={setContainer}>
				{modelLoading && (
					<div
						style={{
							width: canvasWidth,
							height: canvasHeight,
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
						width: canvasWidth,
						height: canvasHeight,
					}}
				/>
			</div>
		</div>
	);
};
