import { Game } from "../../types";
import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { LEAVE_GAME } from "@rpgtools/common/src/gql-mutations";

interface LeaveGameVariables {
	gameId: string;
}

interface LeaveGameData {
	game: Game;
}
interface LeaveGameResult extends GqlMutationResult<Game, LeaveGameVariables> {
	game: Game;
	leaveGame: MutationMethod<Game, LeaveGameVariables>;
}

export default function useLeaveGame(callback): LeaveGameResult {
	const result = useGQLMutation<Game, LeaveGameData, LeaveGameVariables>(LEAVE_GAME, null, {
		onCompleted: callback,
	});
	return {
		...result,
		game: result.data,
		leaveGame: result.mutate,
	};
}
