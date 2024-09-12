import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Model} from "../../types.js";
import {UPDATE_MODEL} from "@rpgtools/common/src/gql-mutations";

interface UpdateModelVariables {
	modelId: string;
	name: string;
	file: any;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface UpdateModelResult extends GqlMutationResult<Model,  UpdateModelVariables>{
	updateModel: MutationMethod<Model, UpdateModelVariables>;
	model: Model;
}

export default function useUpdateModel(): UpdateModelResult {
	const result = useGQLMutation<Model, UpdateModelVariables>(UPDATE_MODEL)
	return {
		...result,
		updateModel: result.mutate,
		model: result.data
	};
};
