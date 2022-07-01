import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";
import {DELETE_POSITIONED_MODEL} from "@rpgtools/common/src/gql-mutations";

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
