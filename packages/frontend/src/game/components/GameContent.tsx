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
import GameControllerFacade from "../GameControllerFacade";
import GameStateFactory from "../GameStateFactory";
import useGameMapChangeSubscription from "../../hooks/game/useGameMapChangeSubscription";

interface GameContentProps {
	currentGame: Game;
	strokes: Stroke[];
	fogStrokes: FogStroke[];
}

export default function GameContent({ currentGame, strokes, fogStrokes }: GameContentProps) {
	const controllerFacade = useRef<GameControllerFacade>();
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [urlLoading, setUrlLoading] = useState<string>();
	const [loadingProgress, setLoadingProgress] = useState<number>();
	const { addStroke } = useAddStroke();
	const { setModelPosition } = useSetModelPosition();
	const { deletePositionedModel } = useDeletePositionedModel();
	const { addFogStroke } = useAddFogStroke();

	const [gameWikiId, setGameWikiId] = useState<string>();

	const [controlsMode, setControlsMode] = useState<string>(CAMERA_CONTROLS);

	useGameMapChangeSubscription(({ map, setFog}) => controllerFacade.current.changeLocation(map, setFog));
	useGameStrokeSubscription((stroke) => controllerFacade.current.stroke(stroke));
	useGameModelAddedSubscription((model) => controllerFacade.current.addModel(model));
	useGameModelPositionedSubscription((model) => controllerFacade.current.updateModel(model));
	useGameModelDeletedSubscription((model) => controllerFacade.current.removeModel(model));
	useGameFogSubscription((fogStroke) => controllerFacade.current.fogStroke(fogStroke));

	useEffect(() => {
		return () => controllerFacade.current.tearDown();
	}, []);

	const setupControllerFacade = (renderCanvas: HTMLCanvasElement) => {
		if(!renderCanvas || controllerFacade.current) {
			return;
		}
		const gameState = GameStateFactory(
			renderCanvas,
			currentGame
		);
		controllerFacade.current = new GameControllerFacade(gameState);;
		controllerFacade.current.addPaintingFinishedCallback(async (stroke) => addStroke({...stroke, strokeId: stroke._id}));
		controllerFacade.current.addFogFinishedCallback(async (stroke) => addFogStroke({...stroke, strokeId: stroke._id}));
		controllerFacade.current.addRemoveModelCallback(async (model) => deletePositionedModel({gameId: currentGame._id, positionedModelId: model._id}));
		strokes.forEach((stroke) => controllerFacade.current.stroke(stroke));
		fogStrokes.forEach((fogStroke) => controllerFacade.current.fogStroke(fogStroke));
		currentGame.models.forEach((model) => controllerFacade.current.addModel(model));
		controllerFacade.current.addChangeControlsCallback((mode) => setControlsMode(mode));
		controllerFacade.current.addPositionedModelUpdatedCallback((model) => setModelPosition({...model, positionedModelId: model._id}));
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
					ref={(node) => setupControllerFacade(node)}
					style={{
						flexGrow: 1,
						display: "flex",
					}}
				/>
				<InitiativeTracker />
				<GameWikiDrawer wikiId={gameWikiId} />
				<GameDrawer
					controllerFacade={controllerFacade.current}
					controlsMode={controlsMode}
					setGameWikiId={setGameWikiId}
				/>
				<GameControlsToolbar
					controlsMode={controlsMode}
					setControlsMode={(mode) => controllerFacade.current.changeControls(mode)}
				/>
			</div>
		</>
	);
};
