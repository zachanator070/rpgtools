import React, { useState } from "react";
import { Select, Slider } from "antd";
import {
	BRUSH_ERASE,
	BRUSH_FOG,
	DEFAULT_BRUSH_SIZE,
} from "../../controls/PaintControls";
import ToolTip from "../ToolTip";
import {GameRenderer} from "../../rendering/GameRenderer";

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
				<Select
					value={brushType}
					style={{ width: 120 }}
					onChange={async (value) => {
						await setBrushType(value);
						renderer.getFogControls().setBrushType(value);
					}}
				>
					<Select.Option value={BRUSH_FOG} default>
						Fog
					</Select.Option>
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
						renderer.getFogControls().setBrushSize(value);
					}}
				/>
			</div>
			<div className={"margin-md"}>
				<h3>My Fog Opacity</h3>
				<ToolTip>
					<p>
						Change the opacity of fog for yourself only. Has no effect on fog
						for other players.
					</p>
				</ToolTip>
				<Slider
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
