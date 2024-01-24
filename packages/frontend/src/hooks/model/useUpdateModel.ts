import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Model } from "../../types";
import { UPDATE_MODEL } from "@rpgtools/common/src/gql-mutations";
import { UploadFile } from "antd";

interface UpdateModelVariables {
	modelId: string;
	name: string;
	file: UploadFile;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface UpdateModelData {
	updateModel: Model;
}
interface UpdateModelResult extends GqlMutationResult<Model, UpdateModelVariables> {
	updateModel: MutationMethod<Model, UpdateModelVariables>;
	model: Model;
}

export default function useUpdateModel(): UpdateModelResult {
	const result = useGQLMutation<Model, UpdateModelData, UpdateModelVariables>(UPDATE_MODEL);
	return {
		...result,
		updateModel: result.mutate,
		model: result.data,
	};
}
