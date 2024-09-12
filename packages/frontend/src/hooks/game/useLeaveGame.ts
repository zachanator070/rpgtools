import {Game} from "../../types.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {LEAVE_GAME} from "@rpgtools/common/src/gql-mutations";

interface LeaveGameVariables {
	gameId: string;
}

interface LeaveGameResult extends GqlMutationResult<Game, LeaveGameVariables> {
	game: Game;
	leaveGame: MutationMethod<Game, LeaveGameVariables>
}

export default function useLeaveGame(callback): LeaveGameResult {

	const result = useGQLMutation<Game, LeaveGameVariables>(LEAVE_GAME, {} , {
		onCompleted: callback,
	});
	return {
		...result,
		game: result.data,
		leaveGame: result.mutate
	};
};
