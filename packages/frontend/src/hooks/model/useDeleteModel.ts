import useGetModels from "./useGetModels";
import useMyPermissions from "../authorization/useMyPermissions";
import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {useParams} from "react-router-dom";
import useCurrentWorld from "../world/useCurrentWorld";
import {Model} from "../../types";
import {DELETE_MODEL} from "@rpgtools/common/src/gql-mutations";

interface DeleteModelVariables {
	modelId: string;
}

interface DeleteModelResult {
	deleteModel: MutationMethod<Model, DeleteModelVariables>
}

export default function useDeleteModel(callback: (data: Model) => Promise<void>): DeleteModelResult {
	const { refetch } = useGetModels();
	const { refetch: refetchPermissions } = useMyPermissions();
	const {currentWorld} = useCurrentWorld();
	const params = useParams();

	const result = useGQLMutation<Model, DeleteModelVariables>(
		DELETE_MODEL,
		{ modelId: params.model_id },
		{
			onCompleted: async (data: Model) => {
				await refetch();
				await refetchPermissions({worldId: currentWorld._id});
				await callback(data);
			},
			displayErrors: true,
		}
	);
	return {
		...result,
		deleteModel: result.mutate
	}
};
