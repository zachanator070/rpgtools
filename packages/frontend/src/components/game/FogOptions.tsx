import React, { useState } from "react";
import {
	BRUSH_ERASE,
	BRUSH_FOG,
	DEFAULT_BRUSH_SIZE,
} from "../../controls/PaintControls";
import ToolTip from "../generic/ToolTip";
import {GameRenderer} from "../../rendering/GameRenderer";
import NumberSlider from "../generic/NumberSlider";
import DropDownSelect from "../generic/DropDownSelect";
import DropDownOption from "../generic/DropDownOption";

interface FogOptionsProps {
	renderer: GameRenderer;
}

export default function FogOptions({ renderer }: FogOptionsProps) {
	const [brushType, setBrushType] = useState(BRUSH_FOG);
	const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);

	return (
		<>
			<div className={"margin-md"}>
				<h3>Brush Type</h3>
				<DropDownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getFogControls().setBrushType(value);
					}}
				>
					<DropDownOption value={BRUSH_FOG} selectedByDefault={true}>
						Fog
					</DropDownOption>
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
						renderer.getFogControls().setBrushSize(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>My Fog Opacity</h3>
				<ToolTip title={"Change the opacity of fog for yourself only. Has no effect on fog for other players."}/>
				<NumberSlider
					min={0}
					max={100}
					onChange={async (value) => {
						renderer.getFogControls().setDrawMeshOpacity(value / 100);
					}}
					defaultValue={100}
				/>
			</div>
		</>
	);
};
