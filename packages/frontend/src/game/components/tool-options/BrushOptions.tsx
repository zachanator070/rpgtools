import React, { useState } from "react";
import PrimaryCheckbox from "../../../components/widgets/PrimaryCheckbox";
import ColorInput from "../../../components/widgets/input/ColorInput";
import DropdownSelect from "../../../components/widgets/DropdownSelect";
import NumberSlider from "../../../components/widgets/NumberSlider";
import GameControllerManager from "../../GameControllerManager";
import {BRUSH_CIRCLE, BRUSH_ERASE, BRUSH_LINE, BRUSH_SQUARE} from "../../controller/PaintController";

interface BrushOptionsProps {
	controllerManager: GameControllerManager
}

export default function BrushOptions({ controllerManager }: BrushOptionsProps) {
	const [brushColor, setBrushColor] = useState(controllerManager.paintController.getBrushColor());
	const [brushType, setBrushType] = useState(controllerManager.paintController.getBrushType());
	const [brushSize, setBrushSize] = useState(controllerManager.paintController.getBrushSize());
	const [fillBrush, setFillBrush] = useState(controllerManager.paintController.getBrushFill());

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
						controllerManager.paintController.setBrushColor(value);
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
						controllerManager.paintController.setBrushType(value);
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
						controllerManager.paintController.setBrushSize(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>Fill Brush</h3>
				<PrimaryCheckbox
					checked={fillBrush}
					onChange={(checked) => {
						setFillBrush(checked);
						controllerManager.paintController.setBrushFill(checked);
					}}
				/>
			</div>
		</>
	);
};
