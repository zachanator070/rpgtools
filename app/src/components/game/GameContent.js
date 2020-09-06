import React, {useEffect, useRef, useState} from 'react';
import {GameRenderer} from "./GameRenderer";
import {notification} from "antd";
import useAddStroke from "../../hooks/useAddStroke";
import {useGameStrokeSubscription} from "../../hooks/useGameStrokeSubscription";

export const GameContent = ({currentGame, children}) => {

	const renderCanvas = useRef();
	const [renderer, setRenderer] = useState();
	const {addStroke} = useAddStroke();

	// const {game} = useGameStrokeSubscription();

	useEffect(() => {
		(async () => {
			let newRenderer = renderer;
			if(!newRenderer){
				newRenderer = new GameRenderer(renderCanvas.current, currentGame.map && currentGame.map.mapImage, addStroke);
				await setRenderer(newRenderer);
			}

			if(currentGame && currentGame.map && currentGame.map.mapImage){
				let needsSetup = false;
				if(newRenderer.pixelsPerFoot !== currentGame.map.pixelsPerFoot){
					newRenderer.pixelsPerFoot = currentGame.map.pixelsPerFoot;
					needsSetup = true;
				}
				if(
					(!newRenderer.mapImage && currentGame.map.mapImage) ||
					(newRenderer.mapImage && !currentGame.map.mapImage) ||
					(newRenderer.mapImage._id !== currentGame.map.mapImage._id)
				){
					newRenderer.mapImage = currentGame.map.mapImage;
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
					newRenderer.setupMap();
				}
			}

		})();
	}, [currentGame]);

	return <>
		<div
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
			{React.cloneElement(children, {renderer})}
		</div>
	</>;

};