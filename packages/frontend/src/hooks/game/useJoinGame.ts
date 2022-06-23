import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";
import {JOIN_GAME} from "@rpgtools/common/src/gql-mutations";

interface JoinGameVariables {
	gameId: string;
	password?: string;
	characterName?: string;
}

interface JoinGameResult extends GqlMutationResult<Game, JoinGameVariables> {
	joinGame: MutationMethod<Game, JoinGameVariables>;
}

export default (callback): JoinGameResult => {
	const result = useGQLMutation<Game, JoinGameVariables>(JOIN_GAME, {}, { onCompleted: callback });
	return {
		...result,
		joinGame: result.mutate
	};
};
