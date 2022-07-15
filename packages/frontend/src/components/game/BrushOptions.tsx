import React, { useState } from "react";
import { Checkbox, Input, Select, Slider } from "antd";
import {
	BRUSH_CIRCLE,
	BRUSH_ERASE,
	BRUSH_LINE,
	BRUSH_SQUARE,
	DEFAULT_BRUSH_COLOR,
	DEFAULT_BRUSH_FILL,
	DEFAULT_BRUSH_SIZE,
	DEFAULT_BRUSH_TYPE,
} from "../../controls/PaintControls";
import {GameRenderer} from "../../rendering/GameRenderer";

interface BrushOptionsProps {
	renderer: GameRenderer
}

export default function BrushOptions({ renderer }: BrushOptionsProps) {
	const [brushColor, setBrushColor] = useState(DEFAULT_BRUSH_COLOR);
	const [brushType, setBrushType] = useState(DEFAULT_BRUSH_TYPE);
	const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
	const [fillBrush, setFillBrush] = useState(DEFAULT_BRUSH_FILL);

	return (
		<>
			<div className={"margin-md"}>
				<h3>Brush Color</h3>
				<Input
					style={{ width: "50px" }}
					type={"color"}
					value={brushColor}
					onChange={async (e) => {
						const value = e.target.value;
						await setBrushColor(value);
						renderer.getPaintControls().setBrushColor(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>Brush Type</h3>
				<Select
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getPaintControls().setBrushType(value);
					}}
				>
					<Select.Option value={BRUSH_LINE} default>
						Line
					</Select.Option>
					<Select.Option value={BRUSH_SQUARE}>Square</Select.Option>
					<Select.Option value={BRUSH_CIRCLE}>Circle</Select.Option>
					<Select.Option value={BRUSH_ERASE}>Erase</Select.Option>
				</Select>
			</div>
			<div className={"margin-md"}>
				<h3>Brush Size</h3>
				<Slider
					min={1}
					max={20}
					value={brushSize}
					onChange={async (value) => {
						await setBrushSize(value);
						renderer.getPaintControls().setBrushSize(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>Fill Brush</h3>
				<Checkbox
					checked={fillBrush}
					onChange={async (e) => {
						await setFillBrush(e.target.checked);
						renderer.getPaintControls().setBrushFill(e.target.checked);
					}}
				/>
			</div>
		</>
	);
};
