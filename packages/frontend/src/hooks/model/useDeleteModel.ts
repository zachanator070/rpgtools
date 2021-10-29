import { useGetModels } from "./useGetModels";
import { useMyPermissions } from "../authorization/useMyPermissions";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import useCurrentWorld from "../world/useCurrentWorld";
import {Model} from "../../types";

export const DELETE_MODEL = gql`
	mutation deleteModel($modelId: ID!) {
		deleteModel(modelId: $modelId) {
			_id
		}
	}
`;
interface DeleteModelVariables {
	modelId: string;
}

interface DeleteModelResult {
	deleteModel: MutationMethod<Model, DeleteModelVariables>
}

export const useDeleteModel = (callback: (data: Model) => Promise<void>): DeleteModelResult => {
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
