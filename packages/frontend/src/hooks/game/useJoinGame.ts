import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Game } from "../../types";
import { JOIN_GAME } from "@rpgtools/common/src/gql-mutations";

interface JoinGameVariables {
	gameId: string;
	password?: string;
	characterName?: string;
}

interface JoinGameData {
	joinGame: Game;
}
interface JoinGameResult extends GqlMutationResult<Game, JoinGameVariables> {
	joinGame: MutationMethod<Game, JoinGameVariables>;
}

export default function useJoinGame(callback): JoinGameResult {
	const result = useGQLMutation<Game, JoinGameData, JoinGameVariables>(JOIN_GAME, null, {
		onCompleted: callback,
	});
	return {
		...result,
		joinGame: result.mutate,
	};
}
