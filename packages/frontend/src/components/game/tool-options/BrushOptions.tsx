import React, { useState } from "react";
import {
	BRUSH_CIRCLE,
	BRUSH_ERASE,
	BRUSH_LINE,
	BRUSH_SQUARE,
} from "../../../controls/PaintControls";
import {GameRenderer} from "../../../rendering/GameRenderer";
import PrimaryCheckbox from "../../widgets/PrimaryCheckbox";
import ColorInput from "../../widgets/input/ColorInput";
import DropdownSelect from "../../widgets/DropdownSelect";
import NumberSlider from "../../widgets/NumberSlider";

interface BrushOptionsProps {
	renderer: GameRenderer
}

export default function BrushOptions({ renderer }: BrushOptionsProps) {
	const [brushColor, setBrushColor] = useState(renderer.getPaintControls().getBrushColor());
	const [brushType, setBrushType] = useState(renderer.getPaintControls().getBrushType());
	const [brushSize, setBrushSize] = useState(renderer.getPaintControls().getBrushSize());
	const [fillBrush, setFillBrush] = useState(renderer.getPaintControls().getBrushFill());

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
				<DropdownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getPaintControls().setBrushType(value);
					}}
					options={[
						{value: BRUSH_LINE, label: 'Line'},
						{value: BRUSH_SQUARE, label: 'Square'},
						{value: BRUSH_CIRCLE, label: 'Circle'},
						{value: BRUSH_ERASE, label: 'Erase'},
					]}
				/>
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
