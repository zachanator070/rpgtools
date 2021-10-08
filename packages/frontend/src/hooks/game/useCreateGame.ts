import useCurrentWorld from "../world/useCurrentWorld";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";

export const CREATE_GAME = gql`
	${ACCESS_CONTROL_LIST}
	mutation createGame($worldId: ID!, $password: String, $characterName: String){
		createGame(worldId: $worldId, password: $password, characterName: $characterName){
			_id
			...accessControlList
		}
	}
`;
interface CreateGameVariables {
	worldId: string;
	password: string;
	characterName?: string;
}

interface CreateGameResult extends GqlMutationResult<Game, CreateGameVariables>{
	createGame: MutationMethod<Game, CreateGameVariables>;
}

export default (callback): CreateGameResult => {
	const { currentWorld } = useCurrentWorld();

	const result = useGQLMutation<Game, CreateGameVariables>(CREATE_GAME, {gameId: currentWorld._id}, { onCompleted: callback });
	return {
		...result,
		createGame: result.mutate
	};
};
