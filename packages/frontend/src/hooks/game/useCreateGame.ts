import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {CREATE_GAME} from "@rpgtools/common/src/gql-mutations";
import {useParams} from "react-router-dom";

interface CreateGameVariables {
	worldId: string;
	password: string;
	characterName?: string;
}

interface CreateGameResult extends GqlMutationResult<Game, CreateGameVariables>{
	createGame: MutationMethod<Game, CreateGameVariables>;
}

export default function useCreateGame(callback): CreateGameResult {
	const { world_id } = useParams();

	const result = useGQLMutation<Game, CreateGameVariables>(CREATE_GAME, {worldId: world_id}, { onCompleted: callback });
	return {
		...result,
		createGame: result.mutate
	};
};
