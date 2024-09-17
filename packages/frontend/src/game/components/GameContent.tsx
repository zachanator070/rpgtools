import React, {createContext, useEffect, useRef, useState} from "react";
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
import {SELECT_MODEL_CONTROLS} from "../GameState";

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
