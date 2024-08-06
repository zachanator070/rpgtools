import React, { useEffect, useState } from "react";

import BrushOptions from "./tool-options/BrushOptions";
import FogOptions from "./tool-options/FogOptions";
import ModelInfo from "./tool-options/ModelInfo";
import GameLocationSettings from "./tool-options/GameLocationSettings";
import AddModelSection from "./tool-options/AddModelSection";
import GameControllerManager from "../GameControllerManager";
import {
	ADD_MODEL_CONTROLS,
	FOG_CONTROLS,
	PAINT_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS
} from "../GameState";
import MenuIcon from "../../components/widgets/icons/MenuIcon";
import CloseIcon from "../../components/widgets/icons/CloseIcon";

interface ControlsContextWindowProps {
	controllerManager: GameControllerManager;
	controlsMode: string;
	setGameWikiId: (id: string) => void
}
export default function ControlsContextWindow({
	controllerManager,
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
			content = <BrushOptions controllerManager={controllerManager} />;
			break;
		case FOG_CONTROLS:
			content = <FogOptions controllerManager={controllerManager} />;
			break;
		case SELECT_MODEL_CONTROLS:
			content = <ModelInfo controllerManager={controllerManager} setGameWikiId={async (wikiId: string) => setGameWikiId(wikiId)} />;
			break;
		case SELECT_LOCATION_CONTROLS:
			content = <GameLocationSettings controllerManager={controllerManager} setGameWikiId={async (wikiId: string) => setGameWikiId(wikiId)} />;
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
