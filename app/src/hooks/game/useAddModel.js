import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {GAME_MODELS} from "../../../../common/src/gql-fragments";

export const ADD_MODEL = gql`
	mutation addModel($gameId: ID!, $modelId: ID!, $wikiId: ID){
		addModel(gameId: $gameId, modelId: $modelId, wikiId: $wikiId){
			_id
			${GAME_MODELS}
		}
	}	
`;
export const useAddModel = () => {
	return useGQLMutation(ADD_MODEL, {});
};