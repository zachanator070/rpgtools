import React, { useState } from "react";
import PrimaryCheckbox from "../../../components/widgets/PrimaryCheckbox";
import ColorInput from "../../../components/widgets/input/ColorInput";
import DropdownSelect from "../../../components/widgets/DropdownSelect";
import NumberSlider from "../../../components/widgets/NumberSlider";
import GameControllerFacade from "../../GameControllerFacade";
import {
	BRUSH_CIRCLE,
	BRUSH_ERASE,
	BRUSH_LINE,
	BRUSH_SQUARE,
	DEFAULT_BRUSH_COLOR, DEFAULT_BRUSH_FILL, DEFAULT_BRUSH_SIZE, DEFAULT_BRUSH_TYPE
} from "../../controller/PaintController";

interface BrushOptionsProps {
	controllerFacade: GameControllerFacade
}

export default function BrushOptions({ controllerFacade }: BrushOptionsProps) {
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
					onChange={(e) => {
						const value = e.target.value;
						setBrushColor(value);
						controllerFacade.setBrushColor(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>Brush Type</h3>
				<DropdownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={(value) => {
						setBrushType(value);
						controllerFacade.setBrushType(value);
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
					onChange={(value) => {
						setBrushSize(value);
						controllerFacade.setBrushSize(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>Fill Brush</h3>
				<PrimaryCheckbox
					checked={fillBrush}
					onChange={(checked) => {
						setFillBrush(checked);
						controllerFacade.setBrushFill(checked);
					}}
				/>
			</div>
		</>
	);
};
