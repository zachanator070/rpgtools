import React from "react";
import BrushOptions from "./BrushOptions";
import FogOptions from "./FogOptions";
import ModelInfo from "./ModelInfo";
import GameLocationSettings from "./GameLocationSettings";
import AddModelSection from "./AddModelSection";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS
} from "../../GameState";

interface ToolOptionsProps {
	controlsMode: string;
	setGameWikiId: (wikiId: string) => Promise<any>
}

export default function ToolOptions({ controlsMode, setGameWikiId }: ToolOptionsProps) {
	let content = null;

	switch (controlsMode) {
		case PAINT_CONTROLS:
			content = <BrushOptions />;
			break;
		case FOG_CONTROLS:
			content = <FogOptions/>;
			break;
		case SELECT_MODEL_CONTROLS:
			content = <ModelInfo setGameWikiId={setGameWikiId} />;
			break;
		case SELECT_LOCATION_CONTROLS:
			content = <GameLocationSettings setGameWikiId={setGameWikiId} />;
			break;
		case ADD_MODEL_CONTROLS:
			content = <AddModelSection />;
	}

	if (!content) {
		return <></>;
	}
	return (
		<>
			<h2
				style={{
					display: "inline",
				}}
			>
				{controlsMode}
			</h2>
			{content}
		</>
	);
};
