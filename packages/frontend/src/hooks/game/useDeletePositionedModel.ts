import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {DELETE_POSITIONED_MODEL} from "@rpgtools/common/src/gql-mutations.js";

interface DeletePositionedModelVariables {
	gameId: string;
	positionedModelId: string;
}

interface DeletePositionedModelResult extends GqlMutationResult<Game,  DeletePositionedModelVariables> {
	deletePositionedModel: MutationMethod<Game, DeletePositionedModelVariables>
}

export default function useDeletePositionedModel(): DeletePositionedModelResult {
	const result = useGQLMutation<Game,  DeletePositionedModelVariables>(DELETE_POSITIONED_MODEL);
	return {
		...result,
		deletePositionedModel: result.mutate
	}
};
