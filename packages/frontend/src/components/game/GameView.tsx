import React, { useEffect } from "react";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import LoadingView from "../LoadingView";
import GameContent from "./GameContent";
import { useNavigate } from "react-router-dom";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import useGameMapChangeSubscription from "../../hooks/game/useGameMapChangeSubscription";
import useMyGames from "../../hooks/game/useMyGames";
import useCurrentUser from "../../hooks/authentication/useCurrentUser";
import useModal from "../widgets/useModal";
import useGameStrokes from "../../hooks/game/useGameStrokes";
import useGameFogStrokes from "../../hooks/game/useGameFogStrokes";

export default function GameView() {
	const { currentWorld, loading: currentWorldLoading } = useCurrentWorld();
	const { currentGame, loading } = useCurrentGame();
	const { strokes, loading: strokeLoading } = useGameStrokes();
	const { fogStrokes, loading: fogStrokeLoading } = useGameFogStrokes();
	const { currentUser } = useCurrentUser();
	const { refetch } = useMyGames();
	useGameMapChangeSubscription();

	const { modalWarning } = useModal();

	const navigate = useNavigate();

	useEffect(() => {
		if (currentGame) {
			let hostGone = true;
			for (const character of currentGame.characters) {
				if (character.player._id === currentGame.host._id) {
					hostGone = false;
				}
			}
			if (hostGone && currentGame.host._id !== currentUser._id) {
				modalWarning({
					title: "Host Gone",
					content: (
						<>
							<p>The host has left the game. This game has ended.</p>
						</>
					),
					onOk: async () => {
						await refetch();
						navigate(`/ui/world/${currentWorld._id}/gameLogin`);
					},
				});
			}
		}
	}, [currentGame]);

	if (
		loading ||
		currentWorldLoading ||
		strokeLoading ||
		fogStrokeLoading ||
		strokes.totalDocs !== strokes.docs.length ||
		fogStrokes.totalDocs !== fogStrokes.docs.length
	) {
		return <LoadingView />;
	}

	if (!currentGame) {
		return (
			<>
				<p>You do not have permission to view this game or this game doesn't exist</p>
			</>
		);
	}

	return (
		<GameContent currentGame={currentGame} strokes={strokes.docs} fogStrokes={fogStrokes.docs} />
	);
}
