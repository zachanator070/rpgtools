import React, { useState } from "react";
import GameControllerFacade from "../../GameControllerFacade";
import {BRUSH_ERASE, BRUSH_FOG, DEFAULT_BRUSH_SIZE} from "../../controller/PaintController";
import DropdownSelect from "../../../components/widgets/DropdownSelect";
import NumberSlider from "../../../components/widgets/NumberSlider";
import ToolTip from "../../../components/widgets/ToolTip";
interface FogOptionsProps {
	controllerFacade: GameControllerFacade;
}

export default function FogOptions({ controllerFacade }: FogOptionsProps) {
	const [brushType, setBrushType] = useState(BRUSH_FOG);
	const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);

	return (
		<>
			<div className={"margin-md"}>
				<h3>Brush Type</h3>
				<DropdownSelect
					value={brushType}
					style={{ width: 120 }}
					onChange={(value) => {
						setBrushType(value);
						controllerFacade.setFogBrushType(value);
					}}
					options={[
						{value: BRUSH_FOG, label: 'Fog'},
						{value: BRUSH_ERASE, label: 'Erase'}
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
						controllerFacade.setFogBrushSize(value);
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
						controllerFacade.setFogOpacity(value / 100);
					}}
					defaultValue={100}
				/>
			</div>
		</>
	);
};
