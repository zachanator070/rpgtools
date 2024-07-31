import React, {Ref, useEffect, useRef, useState} from "react";
import {
	ADD_MODEL_CONTROLS,
	CAMERA_CONTROLS,
	DELETE_CONTROLS,
	FOG_CONTROLS,
	GameRenderer,
	MOVE_MODEL_CONTROLS,
	PAINT_CONTROLS,
	ROTATE_MODEL_CONTROLS,
	SELECT_LOCATION_CONTROLS,
	SELECT_MODEL_CONTROLS,
} from "../../game/GameRenderer";
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
import useModal from "../widgets/useModal";
import FullScreenModal from "../widgets/FullScreenModal";
import ProgressBar from "../widgets/ProgressBar";
import useNotification from "../widgets/useNotification";
import GameController from "../../game/GameController";

interface GameContentProps {
	currentGame: Game;
	strokes: Stroke[];
	fogStrokes: FogStroke[];
}

export default function GameContent({ currentGame, strokes, fogStrokes }: GameContentProps) {
	const renderCanvas: Ref<HTMLCanvasElement> = useRef();
	const [renderer, setRenderer] = useState<GameRenderer>();
	const [gameControls, setGameControls] = useState<GameController>();
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [urlLoading, setUrlLoading] = useState<string>();
	const [loadingProgress, setLoadingProgress] = useState<number>();
	const { addStroke } = useAddStroke();
	const { setModelPosition } = useSetModelPosition();
	const { deletePositionedModel } = useDeletePositionedModel();
	const { addFogStroke } = useAddFogStroke();

	const {modalConfirm} = useModal();
	const {errorNotification} = useNotification();

	const [gameWikiId, setGameWikiId] = useState<string>();

	const [controlsMode, setControlsMode] = useState<string>(CAMERA_CONTROLS);
	const { data: gameStrokeAdded } = useGameStrokeSubscription();
	const { data: gameModelAdded } = useGameModelAddedSubscription();
	const { data: modelPositioned } = useGameModelPositionedSubscription();
	const { gameModelDeleted } = useGameModelDeletedSubscription();
	const { gameFogStrokeAdded } = useGameFogSubscription();
	const renderParent: Ref<HTMLDivElement> = useRef();
	const focusedElement = useRef<HTMLElement>(null);

	useEffect(() => {
		(() => {
			const renderer = new GameRenderer(
				renderCanvas.current,
				currentGame.map && currentGame.map.mapImage,
				addStroke,
				async (url, itemsLoaded, totalItems) => {
					if (itemsLoaded / totalItems !== 1) {
						setShowLoading(true);
					} else {
						setShowLoading(false);
					}
					setUrlLoading(url);
					setLoadingProgress(itemsLoaded / totalItems);
				},
				setModelPosition,
				async (positionedModel) => {
					modalConfirm({
						title: "Confirm Delete",
						content: (
							<>
								Are you sure you want to delete the model{" "}
								{positionedModel.model.name} ?
							</>
						),
						okText: "Yes",
						cancelText: "No",
						onOk: async () => {
							await deletePositionedModel({
								gameId: currentGame._id,
								positionedModelId: positionedModel._id,
							});
						},
					});
				},
				addFogStroke,
				currentGame.map ? currentGame.map.pixelsPerFoot : 1
			);
			const controlsManager = new GameController(renderer);
			setRenderer(renderer);
			setGameControls(controlsManager);
		})();

		const mouseOverListener = (event) => {
			focusedElement.current = event.target as HTMLElement;
		};
		const keyDownListener = ({ code }) => {
			if (
				![
					"KeyP",
					"KeyC",
					"KeyM",
					"KeyR",
					"KeyX",
					"KeyF",
					"KeyS",
					"KeyA",
					"KeyL",
				].includes(code) || renderCanvas.current !== focusedElement.current
			) {
				return;
			}
			switch (code) {
				case "KeyC":
					setControlsMode(CAMERA_CONTROLS);
					break;
				case "KeyP":
					if (currentGame.canPaint) {
						setControlsMode(PAINT_CONTROLS);
					}
					break;
				case "KeyM":
					if (currentGame.canModel) {
						setControlsMode(MOVE_MODEL_CONTROLS);
					}
					break;
				case "KeyR":
					if (currentGame.canModel) {
						setControlsMode(ROTATE_MODEL_CONTROLS);
					}
					break;
				case "KeyX":
					if (currentGame.canModel) {
						setControlsMode(DELETE_CONTROLS);
					}
					break;
				case "KeyF":
					if (currentGame.canWriteFog) {
						setControlsMode(FOG_CONTROLS);
					}
					break;
				case "KeyS":
					setControlsMode(SELECT_MODEL_CONTROLS);
					break;
				case "KeyA":
					if (currentGame.canModel) {
						setControlsMode(ADD_MODEL_CONTROLS);
					}
					break;
				case "KeyL":
					setControlsMode(SELECT_LOCATION_CONTROLS);
					break;
			}
		};
		window.addEventListener("mouseover", mouseOverListener);

		window.addEventListener("keydown", keyDownListener);

		return () => {
			window.removeEventListener("mouseover", mouseOverListener);
			window.removeEventListener("keydown", keyDownListener);
		}
	}, []);

	useEffect(() => {
		if (gameControls) {
			gameControls.changeControls(controlsMode);
		}
	}, [controlsMode]);

	useEffect(() => {
		if (renderer) {
			renderer.updateModel(modelPositioned);
		}
	}, [modelPositioned]);

	useEffect(() => {
		if (gameModelAdded && renderer) {
			renderer.addModel(gameModelAdded);
		}
	}, [gameModelAdded]);

	useEffect(() => {
		if (gameModelDeleted && renderer) {
			renderer.removeModel(gameModelDeleted);
		}
	}, [gameModelDeleted]);

	useEffect(() => {
		if (gameStrokeAdded && renderer) {
			gameControls.getPaintControls().stroke(gameStrokeAdded);
		}
	}, [gameStrokeAdded]);

	useEffect(() => {
		if (gameFogStrokeAdded && renderer) {
			gameControls.getFogControls().stroke(gameFogStrokeAdded);
		}
	}, [gameFogStrokeAdded]);

	useEffect(() => {
		(() => {
			if (!renderer) {
				return;
			}

			if (currentGame && currentGame.map && currentGame.map.mapImage) {
				let needsSetup = false;
				if (renderer.getPixelsPerFoot() !== currentGame.map.pixelsPerFoot) {
					renderer.setPixelsPerFoot(currentGame.map.pixelsPerFoot);
					needsSetup = true;
				}
				if (
					(!renderer.getMapImage() && currentGame.map.mapImage) ||
					(renderer.getMapImage() && !currentGame.map.mapImage) ||
					renderer.getMapImage()._id !== currentGame.map.mapImage._id
				) {
					renderer.setMapImage(currentGame.map.mapImage);
					needsSetup = true;
				}
				if (needsSetup) {
					if (!currentGame.map.mapImage) {
						errorNotification({
							message: "Map Render Error",
							description: `Location: ${currentGame.map.name} has no map image!`,
						});
					}
					if (!currentGame.map.pixelsPerFoot) {
						errorNotification({
							message: "Map Render Error",
							description: `Location: ${currentGame.map.name} has no "pixel per foot" value set!`,
						});
					}
					renderer.setupMap();
				}
				if (gameControls.getPaintControls() && strokes) {
					for (let stroke of strokes) {
						gameControls.getPaintControls().stroke(stroke);
					}
				}
				if (gameControls.getFogControls() && fogStrokes) {
					for (let fogStroke of fogStrokes) {
						gameControls.getFogControls().stroke(fogStroke);
					}
				}
				for (let model of currentGame.models) {
					renderer.addModel(model);
				}
			}
		})();

		const resize = () => {
			if (renderer && renderCanvas.current) {
				renderer.resize(
					renderCanvas.current.clientWidth,
					renderCanvas.current.clientHeight
				);
			}
		};

		window.addEventListener("resize", resize);
	}, [currentGame, strokes, fogStrokes, renderer]);

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
				ref={renderParent}
			>
				<canvas
					ref={renderCanvas}
					style={{
						flexGrow: 1,
						display: "flex",
					}}
				/>
				<InitiativeTracker />
				<GameWikiDrawer wikiId={gameWikiId} />
				<GameDrawer
					renderer={renderer}
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
