import React, { useState } from "react";
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
import PrimaryCheckbox from "../generic/PrimaryCheckbox";
import ColorInput from "../generic/ColorInput";
import DropDownSelect from "../generic/DropDownSelect";
import DropDownOption from "../generic/DropDownOption";
import NumberSlider from "../generic/NumberSlider";

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
				<ColorInput
					style={{ width: "50px" }}
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
				<DropDownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getPaintControls().setBrushType(value);
					}}
				>
					<DropDownOption value={BRUSH_LINE} selectedByDefault={true}>
						Line
					</DropDownOption>
					<DropDownOption value={BRUSH_SQUARE}>Square</DropDownOption>
					<DropDownOption value={BRUSH_CIRCLE}>Circle</DropDownOption>
					<DropDownOption value={BRUSH_ERASE}>Erase</DropDownOption>
				</DropDownSelect>
			</div>
			<div className={"margin-md"}>
				<h3>Brush Size</h3>
				<NumberSlider
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
				<PrimaryCheckbox
					checked={fillBrush}
					onChange={async (checked) => {
						await setFillBrush(checked);
						renderer.getPaintControls().setBrushFill(checked);
					}}
				/>
			</div>
		</>
	);
};
