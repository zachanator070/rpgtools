import React, {createContext, useEffect, useRef, useState} from "react";
import useAddStroke from "../../hooks/game/useAddStroke.js";
import useGameStrokeSubscription from "../../hooks/game/useGameStrokeSubscription.js";
import GameControlsToolbar from "./GameControlsToolbar.tsx";
import useGameModelAddedSubscription from "../../hooks/game/useGameModelAddedSubscription.js";
import useSetModelPosition from "../../hooks/game/useSetModelPosition.js";
import useGameModelPositionedSubscription from "../../hooks/game/useGameModelPosistionedSubscription.js";
import useDeletePositionedModel from "../../hooks/game/useDeletePositionedModel.js";
import useGameModelDeletedSubscription from "../../hooks/game/useGameModelDeletedSubscription.js";
import useAddFogStroke from "../../hooks/game/useAddFogStroke.js";
import useGameFogSubscription from "../../hooks/game/useGameFogSubscription.js";
import GameWikiDrawer from "./GameWikiDrawer.tsx";
import InitiativeTracker from "./initiative-tracker/InitiativeTracker.tsx";
import GameDrawer from "./GameDrawer.tsx";
import {FogStroke, Game, Stroke} from "../../types.js";
import FullScreenModal from "../../components/widgets/FullScreenModal.tsx";
import ProgressBar from "../../components/widgets/ProgressBar.tsx";
import GameControllerFacade from "../GameControllerFacade.js";
import GameStateFactory from "../GameStateFactory.js";
import useGameMapChangeSubscription from "../../hooks/game/useGameMapChangeSubscription.js";
import {SELECT_MODEL_CONTROLS} from "../GameState.js";

interface GameContentProps {
	currentGame: Game;
	strokes: Stroke[];
	fogStrokes: FogStroke[];
}

export const ControllerContext = createContext(null);

export default function GameContent({ currentGame, strokes, fogStrokes }: GameContentProps) {
	const [controllerFacade, setControllerFacade] = useState<GameControllerFacade>();
	// need to use ref for cleanup function
	const controllerRef = useRef<GameControllerFacade>(controllerFacade);
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [urlLoading, setUrlLoading] = useState<string>();
	const [loadingProgress, setLoadingProgress] = useState<number>();
	const { addStroke } = useAddStroke();
	const { setModelPosition } = useSetModelPosition();
	const { deletePositionedModel } = useDeletePositionedModel();
	const { addFogStroke } = useAddFogStroke();

	const [gameWikiId, setGameWikiId] = useState<string>();

	const [controlsMode, setControlsMode] = useState<string>(SELECT_MODEL_CONTROLS);

	useGameMapChangeSubscription(({ map, setFog}) => controllerFacade.changeLocation(map, setFog));
	useGameStrokeSubscription((stroke) => controllerFacade.stroke(stroke));
	useGameModelAddedSubscription((model) => controllerFacade.addModel(model));
	useGameModelPositionedSubscription((model) => controllerFacade.updateModel(model));
	useGameModelDeletedSubscription((model) => controllerFacade.removeModel(model));
	useGameFogSubscription((fogStroke) => controllerFacade.fogStroke(fogStroke));

	useEffect(() => {
		return () => {
			controllerRef.current.tearDown();
		};
	}, []);

	const setupControllerFacade = (renderCanvas: HTMLCanvasElement) => {
		if(!renderCanvas || controllerFacade) {
			return;
		}
		const gameState = GameStateFactory(
			renderCanvas,
			currentGame
		);
		const facade = new GameControllerFacade(gameState);
		facade.addPaintingFinishedCallback(async (stroke) => addStroke({...stroke, strokeId: stroke._id}));
		facade.addFogFinishedCallback(async (stroke) => addFogStroke({...stroke, strokeId: stroke._id}));
		facade.addRemoveModelCallback(async (model) => deletePositionedModel({gameId: currentGame._id, positionedModelId: model._id}));
		strokes.forEach((stroke) => facade.stroke(stroke));
		fogStrokes.forEach((fogStroke) => facade.fogStroke(fogStroke));
		currentGame.models.forEach((model) => facade.addModel(model));
		facade.addChangeControlsCallback((mode) => setControlsMode(mode));
		facade.addPositionedModelUpdatedCallback((model) => setModelPosition({...model, positionedModelId: model._id}));
		setControllerFacade(facade);
		controllerRef.current = facade;
	}

	return (
		<ControllerContext.Provider value={controllerFacade}>
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
					controlsMode={controlsMode}
					setGameWikiId={setGameWikiId}
				/>
				<GameControlsToolbar
					controlsMode={controlsMode}
					setControlsMode={(mode) => controllerFacade.changeControls(mode)}
				/>
			</div>
		</ControllerContext.Provider>
	);
};
