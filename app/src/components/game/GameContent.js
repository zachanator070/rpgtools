import React, {useEffect, useRef, useState} from 'react';
import {GameRenderer} from "./GameRenderer";
import {notification} from "antd";
import useAddStroke from "../../hooks/useAddStroke";
import {useGameStrokeSubscription} from "../../hooks/useGameStrokeSubscription";
import {GameDrawer} from "./GameDrawer";
import {GameControlsHelp} from "./GameControlsHelp";

export const GameContent = ({currentGame, children}) => {

	const renderCanvas = useRef();
	const [renderer, setRenderer] = useState();
	const {addStroke} = useAddStroke();

	const [cameraMode, setCameraMode] = useState('camera');
	// const {game} = useGameStrokeSubscription();

	useEffect(() => {
		(async () => {
			await setRenderer(new GameRenderer(renderCanvas.current, currentGame.map && currentGame.map.mapImage, addStroke, () => {}, setCameraMode));
		})();
	}, []);

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