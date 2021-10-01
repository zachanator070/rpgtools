import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";
import { GAME_MODELS } from "../../../../common/src/gql-fragments";

export const ADD_MODEL = gql`
	${GAME_MODELS}
	mutation addModel($gameId: ID!, $modelId: ID!, $wikiId: ID, $color: String){
		addModel(gameId: $gameId, modelId: $modelId, wikiId: $wikiId, color: $color){
			_id
			...gameModels
		}
	}	
`;
export const useAddModel = () => {
	return useGQLMutation(ADD_MODEL, {});
};
