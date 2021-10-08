import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import { GAME_MODELS } from "../gql-fragments";
import {Game} from "../../types";

export const ADD_MODEL = gql`
	${GAME_MODELS}
	mutation addModel($gameId: ID!, $modelId: ID!, $wikiId: ID, $color: String){
		addModel(gameId: $gameId, modelId: $modelId, wikiId: $wikiId, color: $color){
			_id
			...gameModels
		}
	}	
`;

interface AddModelVariables {
	gameId: string;
	modelId: string;
	wikiId: string;
	color: string;
}

interface AddModelResult extends GqlMutationResult<Game, AddModelVariables> {
	addModel: MutationMethod<Game, AddModelVariables>;
}

export const useAddModel = (): AddModelResult => {
	const result = useGQLMutation<Game, AddModelVariables>(ADD_MODEL);
	return {
		...result,
		addModel: result.mutate
	};
};
