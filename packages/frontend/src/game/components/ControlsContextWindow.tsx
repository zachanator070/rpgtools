import React, { useEffect, useState } from "react";

import BrushOptions from "./tool-options/BrushOptions.js";
import FogOptions from "./tool-options/FogOptions.js";
import ModelInfo from "./tool-options/ModelInfo.js";
import GameLocationSettings from "./tool-options/GameLocationSettings.js";
import AddModelSection from "./tool-options/AddModelSection.js";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS
} from "../GameState.js";
import MenuIcon from "../../components/widgets/icons/MenuIcon.js";
import CloseIcon from "../../components/widgets/icons/CloseIcon.js";

interface ControlsContextWindowProps {
	controlsMode: string;
	setGameWikiId: (id: string) => void
}
export default function ControlsContextWindow({
	controlsMode,
	setGameWikiId,
}: ControlsContextWindowProps) {
	const [visible, setVisible] = useState<boolean>();

	useEffect(() => {
			setVisible(true);
	}, [controlsMode]);

	let content = null;

	switch (controlsMode) {
		case PAINT_CONTROLS:
			content = <BrushOptions/>;
			break;
		case FOG_CONTROLS:
			content = <FogOptions />;
			break;
		case SELECT_MODEL_CONTROLS:
			content = <ModelInfo setGameWikiId={async (wikiId: string) => setGameWikiId(wikiId)} />;
			break;
		case SELECT_LOCATION_CONTROLS:
			content = <GameLocationSettings setGameWikiId={async (wikiId: string) => setGameWikiId(wikiId)} />;
			break;
		case ADD_MODEL_CONTROLS:
			content = <AddModelSection />;
	}

	if (!content) {
		return <></>;
	}

	return (
		<>
			<a onClick={async () => setVisible(true)}>
				<div
					className={"margin-lg padding-md"}
					style={{
						borderRadius: "10px",
						position: "absolute",
						bottom: "0px",
						right: "0px",
						backgroundColor: "white",
					}}
				>
					<MenuIcon />
				</div>
			</a>

			<div
				className={"padding-lg"}
				style={{
					display: visible ? "block" : "none",
					position: "absolute",
					right: "0px",
					bottom: "0px",
					height: "50%",
					width: "33%",
					backgroundColor: "white",
					overflowY: "scroll",
					borderTop: "thin solid grey",
				}}
			>
				<span>
					<a
						className={"margin-md"}
						onClick={async () => setVisible(false)}
					>
						<CloseIcon />
					</a>
					<h2
						style={{
							display: "inline",
						}}
					>
						{controlsMode}
					</h2>
				</span>
				{content}
			</div>
		</>
	);
};
