import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";

export const JOIN_GAME = gql`
	${GAME_ATTRIBUTES}
	mutation joinGame($gameId: ID!, $password: String, $characterName: String){
		joinGame(gameId: $gameId, password: $password, characterName: $characterName){
			...gameAttributes
		}
	}
`;

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
