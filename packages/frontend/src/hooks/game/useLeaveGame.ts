import gql from "graphql-tag";
import {Game} from "../../types";
import {GqlMutationResult, useGQLMutation} from "../useGQLMutation";

export const LEAVE_GAME = gql`
	mutation leaveGame($gameId: ID!) {
		leaveGame(gameId: $gameId)
	}
`;

interface LeaveGameVariables {
	gameId: string;
}

interface LeaveGameResult extends GqlMutationResult<Game, LeaveGameVariables> {
	game: Game;
}

export default (callback): LeaveGameResult => {

	const result = useGQLMutation<Game, LeaveGameVariables>(LEAVE_GAME, {} , {
		onCompleted: callback,
	});
	return {
		...result,
		game: result.data
	};
};
