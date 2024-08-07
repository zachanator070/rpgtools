import React, {Ref, useEffect, useRef, useState} from "react";
import {
	ADD_MODEL_CONTROLS,
	CAMERA_CONTROLS,
	DELETE_CONTROLS,
	FOG_CONTROLS,
	MOVE_MODEL_CONTROLS,
	PAINT_CONTROLS,
	ROTATE_MODEL_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS,
} from "../GameState";
import useAddStroke from "../../hooks/game/useAddStroke";
import useGameStrokeSubscription from "../../hooks/game/useGameStrokeSubscription";
import GameControlsToolbar from "./GameControlsToolbar";
import useGameModelAddedSubscription from "../../hooks/game/useGameModelAddedSubscription";
import useSetModelPosition from "../../hooks/game/useSetModelPosition";
import useGameModelPositionedSubscription from "../../hooks/game/useGameModelPosistionedSubscription";
import useDeletePositionedModel from "../../hooks/game/useDeletePositionedModel";
import useGameModelDeletedSubscription from "../../hooks/game/useGameModelDeletedSubscription";
import useAddFogStroke from "../../hooks/game/useAddFogStroke";
import useGameFogSubscription from "../../hooks/game/useGameFogSubscription";
import GameWikiDrawer from "./GameWikiDrawer";
import InitiativeTracker from "./initiative-tracker/InitiativeTracker";
import GameDrawer from "./GameDrawer";
import {FogStroke, Game, Stroke} from "../../types";
import useModal from "../../components/widgets/useModal";
import FullScreenModal from "../../components/widgets/FullScreenModal";
import ProgressBar from "../../components/widgets/ProgressBar";
import GameControllerManager from "../GameControllerManager";
import GameStateFactory from "../GameStateFactory";
import useGameMapChangeSubscription from "../../hooks/game/useGameMapChangeSubscription";

interface GameContentProps {
	currentGame: Game;
	strokes: Stroke[];
	fogStrokes: FogStroke[];
}

export default function GameContent({ currentGame, strokes, fogStrokes }: GameContentProps) {
	const [controllerManager, setControllerManager] = useState<GameControllerManager>();
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [urlLoading, setUrlLoading] = useState<string>();
	const [loadingProgress, setLoadingProgress] = useState<number>();
	const { addStroke } = useAddStroke();
	const { setModelPosition } = useSetModelPosition();
	const { deletePositionedModel } = useDeletePositionedModel();
	const { addFogStroke } = useAddFogStroke();

	const {modalConfirm} = useModal();

	const [gameWikiId, setGameWikiId] = useState<string>();

	const [controlsMode, setControlsMode] = useState<string>(CAMERA_CONTROLS);

	const {data: mapChangeGame} = useGameMapChangeSubscription();
	const { data: gameStrokeAdded } = useGameStrokeSubscription();
	const { data: gameModelAdded } = useGameModelAddedSubscription();
	const { data: modelPositioned } = useGameModelPositionedSubscription();
	const { gameModelDeleted } = useGameModelDeletedSubscription();
	const { gameFogStrokeAdded } = useGameFogSubscription();

	const focusedElement = useRef<HTMLElement>(null);

	useEffect(() => {
		if (controllerManager) {
			controllerManager.mapController.setLocation(mapChangeGame.map);
		}
	}, [mapChangeGame]);

	useEffect(() => {
		controllerManager.changeControls(controlsMode);
	}, [controlsMode])

	const trySetupControllerManager = (renderCanvas: HTMLCanvasElement) => {
		if(!renderCanvas || controllerManager) {
			return;
		}
		const gameState = GameStateFactory(
			renderCanvas,
			currentGame,
			currentGame.map && currentGame.map.mapImage,
			currentGame.map ? currentGame.map.pixelsPerFoot : 1
		);
		if (currentGame.map && currentGame.map.mapImage) {
			gameState.location = currentGame.map;
		}
		const controlsManager = new GameControllerManager(gameState);
		setControllerManager(controlsManager);
	}

	return (
		<>
			<FullScreenModal title={"Game Loading"} visible={showLoading} closable={false}>
				<div className={"margin-lg"}>
					Loaded {urlLoading}
					<br />
					<ProgressBar
						strokeColor={{
							from: "#108ee9",
							to: "#87d068",
						}}
						percent={loadingProgress * 100}
					/>
				</div>
			</FullScreenModal>
			<div
				style={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<canvas
					ref={(node) => trySetupControllerManager(node)}
					style={{
						flexGrow: 1,
						display: "flex",
					}}
				/>
				<InitiativeTracker />
				<GameWikiDrawer wikiId={gameWikiId} />
				<GameDrawer
					controllerManager={controllerManager}
					controlsMode={controlsMode}
					setGameWikiId={setGameWikiId}
				/>
				<GameControlsToolbar
					controlsMode={controlsMode}
					setControlsMode={setControlsMode}
				/>
			</div>
		</>
	);
};
