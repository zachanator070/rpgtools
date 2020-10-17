import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {GAME_MODELS} from "@rpgtools/common/src/gql-fragments";

export const DELETE_POSITIONED_MODEL = gql`
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			${GAME_MODELS}
		}
	}	
`;
export const useDeletePositionedModel = () => {
	return useGQLMutation(DELETE_POSITIONED_MODEL, {});
};