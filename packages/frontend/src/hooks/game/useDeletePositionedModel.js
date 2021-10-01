import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";
import { GAME_MODELS } from "../../../../common/src/gql-fragments";

export const DELETE_POSITIONED_MODEL = gql`
	${GAME_MODELS}
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			...gameModels		
		}
	}	
`;
export const useDeletePositionedModel = () => {
	return useGQLMutation(DELETE_POSITIONED_MODEL, {});
};
