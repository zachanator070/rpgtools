import React, {useRef} from 'react';
import {GameRenderer} from "./GameRenderer";
import {GameDrawer} from "./GameDrawer";
import useCurrentGame from "../../hooks/useCurrentGame";
import {LoadingView} from "../LoadingView";
import {GameContent} from "./GameContent";


export const GameView = () => {

	const {currentGame, loading} = useCurrentGame();

	if(loading){
		return <LoadingView/>;
	}

	if(!currentGame){
		return <>
			<p>
				You do not have permission to view this game or this game doesn't exist
			</p>
		</>;
	}

	return <GameContent>
		<GameDrawer/>
	</GameContent>

};