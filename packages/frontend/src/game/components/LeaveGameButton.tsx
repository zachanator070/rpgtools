import React from "react";
import useCurrentGame from "../../hooks/game/useCurrentGame.js";
import useLeaveGame from "../../hooks/game/useLeaveGame.js";
import { useNavigate } from "react-router-dom";
import useMyGames from "../../hooks/game/useMyGames.js";
import useCurrentWorld from "../../hooks/world/useCurrentWorld.js";
import PrimaryDangerButton from "../../components/widgets/PrimaryDangerButton.tsx";

export default function LeaveGameButton() {
	const { currentWorld } = useCurrentWorld();

	const navigate = useNavigate();

	const { currentGame } = useCurrentGame();
	const { refetch } = useMyGames();
	const { leaveGame } = useLeaveGame(async () => {
		await refetch();
		navigate(`/ui/world/${currentWorld._id}/gameLogin`);
	});

	return (
		<PrimaryDangerButton
			onClick={async () => {
				await leaveGame({gameId: currentGame._id});
			}}
		>
			Leave Game
		</PrimaryDangerButton>
	);
};
