import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import useGetModels from "./useGetModels";
import { Model } from "../../types";
import useCurrentWorld from "../world/useCurrentWorld";
import { CREATE_MODEL } from "@rpgtools/common/src/gql-mutations";
import { UploadFile } from "antd";

interface CreateModelVariables {
	name: string;
	file: UploadFile;
	worldId: string;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface CreateModelData {
	createModel: Model;
}
interface CreateModelResult extends GqlMutationResult<Model, CreateModelVariables> {
	createModel: MutationMethod<Model, CreateModelVariables>;
}
export default function useCreateModel(
	callback: (data: Model) => Promise<void>,
): CreateModelResult {
	const { refetch } = useGetModels();
	const { currentWorld } = useCurrentWorld();
	const result = useGQLMutation<Model, CreateModelData, CreateModelVariables>(CREATE_MODEL, null, {
		onCompleted: async (data: Model) => {
			await refetch({ worldId: currentWorld._id });
			await callback(data);
		},
	});
	return {
		...result,
		createModel: result.mutate,
	};
}
