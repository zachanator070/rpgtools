import React, {useEffect, useRef, useState} from "react";
import {
	CAMERA_CONTROLS,
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
	const controllerManager = useRef<GameControllerManager>();
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [urlLoading, setUrlLoading] = useState<string>();
	const [loadingProgress, setLoadingProgress] = useState<number>();
	const { addStroke } = useAddStroke();
	const { setModelPosition } = useSetModelPosition();
	const { deletePositionedModel } = useDeletePositionedModel();
	const { addFogStroke } = useAddFogStroke();

	const [gameWikiId, setGameWikiId] = useState<string>();

	const [controlsMode, setControlsMode] = useState<string>(CAMERA_CONTROLS);

	useGameMapChangeSubscription(({ map, setFog}) => controllerManager.current.changeLocation(map, setFog));
	useGameStrokeSubscription((stroke) => controllerManager.current.stroke(stroke));
	useGameModelAddedSubscription((model) => controllerManager.current.addModel(model));
	useGameModelPositionedSubscription((model) => controllerManager.current.updateModel(model));
	useGameModelDeletedSubscription((model) => controllerManager.current.removeModel(model));
	useGameFogSubscription((fogStroke) => controllerManager.current.fogStroke(fogStroke));

	useEffect(() => {
		return () => controllerManager.current.tearDown();
	}, []);

	const setupControllerManager = (renderCanvas: HTMLCanvasElement) => {
		if(!renderCanvas || controllerManager.current) {
			return;
		}
		const gameState = GameStateFactory(
			renderCanvas,
			currentGame
		);
		const controlsManager = new GameControllerManager(gameState);
		controlsManager.addPaintingFinishedCallback(async (stroke) => addStroke({...stroke, strokeId: stroke._id}));
		controlsManager.addFogFinishedCallback(async (stroke) => addFogStroke({...stroke, strokeId: stroke._id}));
		controlsManager.addRemoveModelCallback(async (model) => deletePositionedModel({gameId: currentGame._id, positionedModelId: model._id}));
		controllerManager.current = controlsManager;
		strokes.forEach((stroke) => controllerManager.current.stroke(stroke));
		fogStrokes.forEach((fogStroke) => controllerManager.current.fogStroke(fogStroke));
		currentGame.models.forEach((model) => controllerManager.current.addModel(model));
		controlsManager.addChangeControlsCallback((mode) => setControlsMode(mode));
		controlsManager.addPositionedModelUpdatedCallback((model) => setModelPosition({...model, positionedModelId: model._id}));
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
					ref={(node) => setupControllerManager(node)}
					style={{
						flexGrow: 1,
						display: "flex",
					}}
				/>
				<InitiativeTracker />
				<GameWikiDrawer wikiId={gameWikiId} />
				<GameDrawer
					controllerManager={controllerManager.current}
					controlsMode={controlsMode}
					setGameWikiId={setGameWikiId}
				/>
				<GameControlsToolbar
					controlsMode={controlsMode}
					setControlsMode={(mode) => controllerManager.current.changeControls(mode)}
				/>
			</div>
		</>
	);
};
