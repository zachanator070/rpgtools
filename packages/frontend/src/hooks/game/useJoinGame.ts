import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {JOIN_GAME} from "@rpgtools/common/src/gql-mutations.js";

interface JoinGameVariables {
	gameId: string;
	password?: string;
	characterName?: string;
}

interface JoinGameResult extends GqlMutationResult<Game, JoinGameVariables> {
	joinGame: MutationMethod<Game, JoinGameVariables>;
}

export default function useJoinGame(callback): JoinGameResult {
	const result = useGQLMutation<Game, JoinGameVariables>(JOIN_GAME, {}, { onCompleted: callback });
	return {
		...result,
		joinGame: result.mutate
	};
};
