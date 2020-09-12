import React, {useEffect, useRef, useState} from 'react';
import {GameRenderer} from "../../rendering/GameRenderer";
import {notification} from "antd";
import useAddStroke from "../../hooks/game/useAddStroke";
import {useGameStrokeSubscription} from "../../hooks/game/useGameStrokeSubscription";
import {GameDrawer} from "./GameDrawer";
import {GameControlsHelp} from "./GameControlsHelp";
import {useGameModelAddedSubscription} from "../../hooks/game/useGameModelAddedSubscription";
import {useSetModelPosition} from "../../hooks/game/useSetModelPosition";
import {useGameModelPositionedSubscription} from "../../hooks/game/useGameModelPosistionedSubscription";

export const GameContent = ({currentGame, children}) => {

	const renderCanvas = useRef();
	const [renderer, setRenderer] = useState();
	const {addStroke} = useAddStroke();
	const {setModelPosition} = useSetModelPosition();

	const [cameraMode, setCameraMode] = useState('camera');
	const {data: gameStrokeAdded} = useGameStrokeSubscription();
	const {data: gameModelAdded} = useGameModelAddedSubscription();
	const {data: modelPositioned} = useGameModelPositionedSubscription();

	useEffect(() => {
		(async () => {
			await setRenderer(
				new GameRenderer(
					renderCanvas.current,
					currentGame.map && currentGame.map.mapImage,
					addStroke,
					() => {},
					setCameraMode,
					setModelPosition
				)
			);
		})();
		renderCanvas.current.addEventListener('mouseover', (event) =>{
			if((event.toElement || event.relatedTarget) !== renderCanvas.current){
				return;
			}
			renderCanvas.current.focus();
		});
	}, []);

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
		if(gameStrokeAdded && renderer){
			renderer.paintControls.stroke(gameStrokeAdded);
		}
	}, [gameStrokeAdded])

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
				for(let model of currentGame.models){
					renderer.addModel(model);
				}
			}

		})();
	}, [currentGame, renderer]);

	return <>
		<div
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
			<GameDrawer renderer={renderer}/>
			<GameControlsHelp cameraMode={cameraMode}/>
		</div>
	</>;

};