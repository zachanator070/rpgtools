import useCurrentWorld from "../world/useCurrentWorld";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
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

export default function useCreateGame(callback): CreateGameResult {
	const { currentWorld } = useCurrentWorld();

	const result = useGQLMutation<Game, CreateGameVariables>(CREATE_GAME, {gameId: currentWorld._id}, { onCompleted: callback });
	return {
		...result,
		createGame: result.mutate
	};
};
