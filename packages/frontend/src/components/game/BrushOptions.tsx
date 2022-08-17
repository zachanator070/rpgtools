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
import PrimaryCheckbox from "../widgets/PrimaryCheckbox";
import ColorInput from "../widgets/ColorInput";
import DropdownSelect from "../widgets/DropdownSelect";
import DropdownOption from "../widgets/DropdownOption";
import NumberSlider from "../widgets/NumberSlider";

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
				<DropdownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getPaintControls().setBrushType(value);
					}}
				>
					<DropdownOption value={BRUSH_LINE} selectedByDefault={true}>
						Line
					</DropdownOption>
					<DropdownOption value={BRUSH_SQUARE}>Square</DropdownOption>
					<DropdownOption value={BRUSH_CIRCLE}>Circle</DropdownOption>
					<DropdownOption value={BRUSH_ERASE}>Erase</DropdownOption>
				</DropdownSelect>
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
