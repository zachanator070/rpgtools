import {Game} from "../../types";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {LEAVE_GAME} from "@rpgtools/common/src/gql-mutations";

interface LeaveGameVariables {
	gameId: string;
}

interface LeaveGameResult extends GqlMutationResult<Game, LeaveGameVariables> {
	game: Game;
	leaveGame: MutationMethod<Game, LeaveGameVariables>
}

export default (callback): LeaveGameResult => {

	const result = useGQLMutation<Game, LeaveGameVariables>(LEAVE_GAME, {} , {
		onCompleted: callback,
	});
	return {
		...result,
		game: result.data,
		leaveGame: result.mutate
	};
};
