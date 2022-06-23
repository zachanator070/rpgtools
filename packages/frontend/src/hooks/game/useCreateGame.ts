import useCurrentWorld from "../world/useCurrentWorld";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";
import {CREATE_GAME} from "@rpgtools/common/src/gql-mutations";

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
