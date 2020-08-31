import React, {useEffect, useRef} from 'react';
import {GameRenderer} from "./GameRenderer";

export const GameContent = ({currentGame, children}) => {

	const renderCanvas = useRef();
	const renderer = useRef();

	useEffect(() => {
		renderer.current = new GameRenderer(renderCanvas.current, currentGame);
	}, []);

	return <>
		<div
			style={{flexGrow:1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'}}
		>
			<canvas ref={renderCanvas} style={{width: '100%', height: '100%'}}/>
			{children}
		</div>
	</>;

};