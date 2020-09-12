import React, {useEffect, useRef} from 'react';
import useCurrentGame from "../../hooks/game/useCurrentGame";
import {LoadingView} from "../LoadingView";
import {GameContent} from "./GameContent";
import {useGameRosterSubscription} from "../../hooks/game/useGameRosterSubscription";
import {Modal} from "antd";
import {useHistory} from 'react-router-dom';
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import {useGameMapChangeSubscription} from "../../hooks/game/useGameMapChangeSubscription";


export const GameView = () => {

	const {currentWorld, loading: currentWorldLoading} = useCurrentWorld();
	const {currentGame, loading} = useCurrentGame();
	const {data: mapChangeGame} = useGameMapChangeSubscription();
	const [modal, contextHolder] = Modal.useModal();

	const history = useHistory();

	useEffect(() => {
		if(currentGame){
			let hostGone = true;
			for(let player of currentGame.players){
				if(player._id === currentGame.host._id){
					hostGone = false;
				}
			}
			if(hostGone){
				modal.warning({title: 'Host Gone', content: <p>The host has left the game. This game has ended.</p>, onOk: () => {
						history.push(`/ui/world/${currentWorld._id}/gameLogin`);
					}});
			}
		}

	}, [currentGame]);

	if(loading || currentWorldLoading){
		return <LoadingView/>;
	}

	if(!currentGame){
		return <>
			<p>
				You do not have permission to view this game or this game doesn't exist
			</p>
		</>;
	}

	return <GameContent currentGame={currentGame}/>;

};