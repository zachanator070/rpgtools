import React, {useEffect, useRef, useState} from 'react';
import {
	CAMERA_CONTROLS, DELETE_CONTROLS, FOG_CONTROLS,
	GameRenderer,
	MOVE_MODEL_CONTROLS,
	PAINT_CONTROLS,
	ROTATE_MODEL_CONTROLS
} from "../../rendering/GameRenderer";
import {Progress, Modal, notification} from "antd";
import useAddStroke from "../../hooks/game/useAddStroke";
import {useGameStrokeSubscription} from "../../hooks/game/useGameStrokeSubscription";
import {GameDrawer} from "./GameDrawer";
import {GameControlsHelp} from "./GameControlsHelp";
import {useGameModelAddedSubscription} from "../../hooks/game/useGameModelAddedSubscription";
import {useSetModelPosition} from "../../hooks/game/useSetModelPosition";
import {useGameModelPositionedSubscription} from "../../hooks/game/useGameModelPosistionedSubscription";
import {useDeletePositionedModel} from "../../hooks/game/useDeletePositionedModel";
import {useGameModelDeletedSubscription} from "../../hooks/game/useGameModelDeletedSubscription";
import {useAddFogStroke} from "../../hooks/game/useAddFogStroke";
import {useGameFogSubscription} from "../../hooks/game/useGameFogSubscription";

export const GameContent = ({currentGame}) => {

	const renderCanvas = useRef();
	const [renderer, setRenderer] = useState();
	const [showLoading, setShowLoading] = useState(false);
	const [urlLoading, setUrlLoading] = useState();
	const [loadingProgress, setLoadingProgress] = useState();
	const {addStroke} = useAddStroke();
	const {setModelPosition} = useSetModelPosition();
	const {deletePositionedModel} = useDeletePositionedModel();
	const {addFogStroke} = useAddFogStroke();

	const [controlsMode, setControlsMode] = useState(CAMERA_CONTROLS);
	const {data: gameStrokeAdded} = useGameStrokeSubscription();
	const {data: gameModelAdded} = useGameModelAddedSubscription();
	const {data: modelPositioned} = useGameModelPositionedSubscription();
	const {gameModelDeleted} = useGameModelDeletedSubscription();
	const {gameFogStrokeAdded} = useGameFogSubscription();

	useEffect(() => {
		(async () => {
			await setRenderer(
				new GameRenderer(
					renderCanvas.current,
					currentGame.map && currentGame.map.mapImage,
					addStroke,
					async (url, itemsLoaded, totalItems) => {
						if(itemsLoaded/totalItems !== 1){
							await setShowLoading(true);
						}
						else{
							await setShowLoading(false);
						}
						await setUrlLoading(url);
						await setLoadingProgress(itemsLoaded/totalItems);
					},
					setModelPosition,
					async (positionedModel) => {
						Modal.confirm({
							title: 'Confirm Delete',
							content: <>
								Are you sure you want to delete the model {positionedModel.model.name} ?
							</>,
							okText: 'Yes',
							cancelText: 'No',
							onOk: async () => {
								await deletePositionedModel({gameId: currentGame._id, positionedModelId: positionedModel._id});
							},
							closable: false
						});
					},
					addFogStroke
				)
			);
		})();
		renderCanvas.current.addEventListener('mouseover', (event) =>{
			if((event.toElement || event.relatedTarget) !== renderCanvas.current){
				return;
			}
			renderCanvas.current.focus();
		});

		renderCanvas.current.addEventListener('keydown', async ({code}) => {
			if(!["KeyP", "KeyC", 'KeyM', "KeyR", 'KeyX', 'KeyF'].includes(code)){
				return;
			}
			switch(code){
				case 'KeyC':
					await setControlsMode(CAMERA_CONTROLS);
					break;
				case 'KeyP':
					await setControlsMode(PAINT_CONTROLS);
					break;
				case 'KeyM':
					await setControlsMode(MOVE_MODEL_CONTROLS);
					break;
				case 'KeyR':
					await setControlsMode(ROTATE_MODEL_CONTROLS);
					break;
				case 'KeyX':
					await setControlsMode(DELETE_CONTROLS);
					break;
				case 'KeyF':
					await setControlsMode(FOG_CONTROLS);
					break;
			}
		});
	}, []);

	useEffect(() => {
		if(renderer){
			renderer.changeControls(controlsMode);
		}
	}, [controlsMode])

	useEffect(() => {
		if(renderer){
			renderer.updateModel(modelPositioned);
		}
	}, [modelPositioned])

	useEffect(() => {
		if(gameModelAdded && renderer){
			renderer.addModel(gameModelAdded);
		}
	}, [gameModelAdded]);

	useEffect(() => {
		if(gameModelDeleted && renderer){
			renderer.removeModel(gameModelDeleted);
		}
	}, [gameModelDeleted]);

	useEffect(() => {
		if(gameStrokeAdded && renderer){
			renderer.paintControls.stroke(gameStrokeAdded);
		}
	}, [gameStrokeAdded]);

	useEffect(() => {
		if(gameFogStrokeAdded && renderer){
			renderer.fogControls.stroke(gameFogStrokeAdded);
		}
	}, [gameFogStrokeAdded])

	useEffect(() => {
		(async () => {
			if(!renderer){
				return;
			}

			if(currentGame && currentGame.map && currentGame.map.mapImage){
				let needsSetup = false;
				if(renderer.pixelsPerFoot !== currentGame.map.pixelsPerFoot){
					renderer.pixelsPerFoot = currentGame.map.pixelsPerFoot;
					needsSetup = true;
				}
				if(
					(!renderer.mapImage && currentGame.map.mapImage) ||
					(renderer.mapImage && !currentGame.map.mapImage) ||
					(renderer.mapImage._id !== currentGame.map.mapImage._id)
				){
					renderer.mapImage = currentGame.map.mapImage;
					needsSetup = true;
				}
				if(needsSetup){
					if(!currentGame.map.mapImage){
						notification['error']({
							message: 'Map Render Error',
							description:
								`Location: ${currentGame.map.name} has no map image!`,
						});
					}
					if(!currentGame.map.pixelsPerFoot){
						notification['error']({
							message: 'Map Render Error',
							description:
								`Location: ${currentGame.map.name} has no "pixel per foot" value set!`,
						});
					}
					renderer.setupMap();
				}
				for(let stroke of currentGame.strokes){
					renderer.paintControls.stroke(stroke);
				}
				for(let fogStroke of currentGame.fog){
					renderer.fogControls.stroke(fogStroke);
				}
				for(let model of currentGame.models){
					renderer.addModel(model);
				}
			}

		})();
	}, [currentGame, renderer]);

	return <>
		<Modal
			visible={showLoading}
			footer={null}
			closable={false}
		>
			<div className={'margin-lg'}>
				Loading {urlLoading}
				<br/>
				<Progress
					strokeColor={{
						from: '#108ee9',
						to: '#87d068',
					}}
					percent={loadingProgress * 100}
					status="active"
					showInfo={false}
				/>
			</div>
		</Modal>
		<div
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
			<GameDrawer renderer={renderer}/>
			<GameControlsHelp controlsMode={controlsMode} setControlsMode={setControlsMode}/>
		</div>
	</>;

};