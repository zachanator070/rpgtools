import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {useGetModels} from "./useGetModels";
import {useMyPermissions} from "../authorization/useMyPermissions";
import {Model} from "../../types";
import useCurrentWorld from "../world/useCurrentWorld";
import {CREATE_MODEL} from "@rpgtools/common/src/gql-mutations";

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
export const useCreateModel = (callback: (data: Model) => Promise<void>): CreateModelResult => {
	const { refetch } = useGetModels();
	const {currentWorld} = useCurrentWorld();
	const { refetch: refetchPermissions } = useMyPermissions();
	const result = useGQLMutation<Model, CreateModelVariables>(
		CREATE_MODEL,
		{},
		{
			onCompleted: async (data: Model) => {
				await refetch({worldId: currentWorld._id});
				await refetchPermissions({worldId: currentWorld._id});
				await callback(data);
			},
		}
	);
	return {
		...result,
		createModel: result.mutate
	}
};
