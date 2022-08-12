import React from "react";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS, GameRenderer,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS,
} from "../../rendering/GameRenderer";
import BrushOptions from "./BrushOptions";
import FogOptions from "./FogOptions";
import ModelInfo from "./ModelInfo";
import GameLocationSettings from "./GameLocationSettings";
import AddModelSection from "./AddModelSection";

interface ToolOptionsProps {
	renderer: GameRenderer;
	controlsMode: string;
	setGameWikiId: (wikiId: string) => Promise<any>
}

export default function ToolOptions({ renderer, controlsMode, setGameWikiId }: ToolOptionsProps) {
	let content = null;

	switch (controlsMode) {
		case PAINT_CONTROLS:
			content = <BrushOptions renderer={renderer} />;
			break;
		case FOG_CONTROLS:
			content = <FogOptions renderer={renderer} />;
			break;
		case SELECT_MODEL_CONTROLS:
			content = <ModelInfo renderer={renderer} setGameWikiId={setGameWikiId} />;
			break;
		case SELECT_LOCATION_CONTROLS:
			content = <GameLocationSettings renderer={renderer} setGameWikiId={setGameWikiId} />;
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
