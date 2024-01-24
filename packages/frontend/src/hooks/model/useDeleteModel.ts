import useGetModels from "./useGetModels";
import useGQLMutation, { MutationMethod } from "../useGQLMutation";
import { useParams } from "react-router-dom";
import { Model } from "../../types";
import { DELETE_MODEL } from "@rpgtools/common/src/gql-mutations";

interface DeleteModelVariables {
	modelId: string;
}

interface DeleteModelData {
	deleteModel: Model;
}
interface DeleteModelResult {
	deleteModel: MutationMethod<Model, DeleteModelVariables>;
}

export default function useDeleteModel(
	callback: (data: Model) => Promise<void>,
): DeleteModelResult {
	const { refetch } = useGetModels();
	const params = useParams();

	const result = useGQLMutation<Model, DeleteModelData, DeleteModelVariables>(
		DELETE_MODEL,
		{ modelId: params.model_id },
		{
			onCompleted: async (data: Model) => {
				await refetch();
				await callback(data);
			},
			displayErrors: true,
		},
	);
	return {
		...result,
		deleteModel: result.mutate,
	};
}
