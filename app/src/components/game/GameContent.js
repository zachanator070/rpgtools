import React, {useEffect, useRef} from 'react';
import {GameRenderer} from "./GameRenderer";

export const GameContent = ({currentGame, children}) => {

	const renderCanvas = useRef();
	const renderer = useRef();

	useEffect(() => {
		renderer.current = new GameRenderer(renderCanvas.current, currentGame.map && currentGame.map.mapImage);
	}, []);

	useEffect(() => {
		if(renderer && currentGame && currentGame.map && currentGame.map.mapImage){
			let needsSetup = false;
			if(renderer.current.pixelsPerFoot !== currentGame.map.pixelsPerFoot){
				renderer.current.pixelsPerFoot = currentGame.map.pixelsPerFoot;
				needsSetup = true;
			}
			if(
				(!renderer.current.mapImage && currentGame.map.mapImage) ||
				(renderer.current.mapImage && !currentGame.map.mapImage) ||
				(renderer.current.mapImage._id !== currentGame.map.mapImage._id)
			){
				renderer.current.mapImage = currentGame.map.mapImage;
				needsSetup = true;
			}
			if(needsSetup){
				renderer.current.setupMap();
			}
		}
	}, [currentGame]);

	return <>
		<div
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
			{children}
		</div>
	</>;

};