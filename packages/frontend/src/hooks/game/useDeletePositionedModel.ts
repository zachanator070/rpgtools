import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import { GAME_MODELS } from "../gql-fragments";
import {Game} from "../../types";

export const DELETE_POSITIONED_MODEL = gql`
	${GAME_MODELS}
	mutation deletePositionedModel($gameId: ID!, $positionedModelId: ID!){
		deletePositionedModel(gameId: $gameId, positionedModelId: $positionedModelId){
			_id
			...gameModels		
		}
	}	
`;

interface DeletePositionedModelVariables {
	gameId: string;
	positionedModelId: string;
}

interface DeletePositionedModelResult extends GqlMutationResult<Game,  DeletePositionedModelVariables> {
	deletePositionedModel: MutationMethod<Game, DeletePositionedModelVariables>
}

export const useDeletePositionedModel = (): DeletePositionedModelResult => {
	const result = useGQLMutation<Game,  DeletePositionedModelVariables>(DELETE_POSITIONED_MODEL);
	return {
		...result,
		deletePositionedModel: result.mutate
	}
};
