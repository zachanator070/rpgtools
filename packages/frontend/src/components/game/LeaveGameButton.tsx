import React from "react";
import useCurrentGame from "../../hooks/game/useCurrentGame";
import useLeaveGame from "../../hooks/game/useLeaveGame";
import { useHistory } from "react-router-dom";
import useMyGames from "../../hooks/game/useMyGames";
import useCurrentWorld from "../../hooks/world/useCurrentWorld";
import DangerButton from "../widgets/DangerButton";

export default function LeaveGameButton() {
	const { currentWorld } = useCurrentWorld();

	const history = useHistory();

	const { currentGame } = useCurrentGame();
	const { refetch } = useMyGames();
	const { leaveGame } = useLeaveGame(async () => {
		await refetch();
		history.push(`/ui/world/${currentWorld._id}/gameLogin`);
	});

	return (
		<DangerButton
			onClick={async () => {
				await leaveGame({gameId: currentGame._id});
			}}
		>
			Leave Game
		</DangerButton>
	);
};
