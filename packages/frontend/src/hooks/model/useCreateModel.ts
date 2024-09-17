import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import useGetModels from "./useGetModels.js";
import {Model} from "../../types.js";
import useCurrentWorld from "../world/useCurrentWorld.js";
import {CREATE_MODEL} from "@rpgtools/common/src/gql-mutations.js";

interface CreateModelVariables {
	name: string;
	file: any;
	worldId: string;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface CreateModelResult extends GqlMutationResult<Model, CreateModelVariables>{
	createModel: MutationMethod<Model, CreateModelVariables>
}
export default function useCreateModel(callback: (data: Model) => Promise<void>): CreateModelResult {
	const { refetch } = useGetModels();
	const {currentWorld} = useCurrentWorld();
	const result = useGQLMutation<Model, CreateModelVariables>(
		CREATE_MODEL,
		{},
		{
			onCompleted: async (data: Model) => {
				await refetch({worldId: currentWorld._id});
				await callback(data);
			},
		}
	);
	return {
		...result,
		createModel: result.mutate
	}
};
