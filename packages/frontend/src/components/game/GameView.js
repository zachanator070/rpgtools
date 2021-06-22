import React, { useEffect, useRef } from "react";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import { LoadingView } from "../LoadingView";
import { GameContent } from "./GameContent";
import { Modal, Button } from "antd";
import { useHistory } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import { useGameMapChangeSubscription } from "../../hooks/game/useGameMapChangeSubscription";
import useMyGames from "../../hooks/game/useMyGames";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";

export const GameView = () => {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();
	const { currentGame, loading } = useCurrentGame();
	const { currentUser } = useCurrentUser();
	const { refetch } = useMyGames();
	const { data: mapChangeGame } = useGameMapChangeSubscription();

	const history = useHistory();

	useEffect(() => {
		if (currentGame) {
			let hostGone = true;
			for (let character of currentGame.characters) {
				if (character.player._id === currentGame.host._id) {
					hostGone = false;
				}
			}
			if (hostGone && currentGame.host._id !== currentUser._id) {
				Modal.warning({
					title: "Host Gone",
					closable: false,
					footer: null,
					content: (
						<>
							<p>The host has left the game. This game has ended.</p>
						</>
					),
					onOk: async () => {
						await refetch();
						history.push(`/ui/world/${currentWorld._id}/gameLogin`);
					},
				});
			}
		}
	}, [currentGame]);

	if (loading || currentWorldLoading) {
		return <LoadingView />;
	}

	if (!currentGame) {
		return (
			<>
				<p>
					You do not have permission to view this game or this game doesn't
					exist
				</p>
			</>
		);
	}

	return <GameContent currentGame={currentGame} />;
};
