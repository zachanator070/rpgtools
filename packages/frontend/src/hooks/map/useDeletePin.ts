import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {DELETE_PIN} from "@rpgtools/common/src/gql-mutations";

interface DeletePinVariables {
	pinId: string;
}

interface DeletePinResult extends GqlMutationResult<World, DeletePinVariables>{
	deletePin: MutationMethod<World, DeletePinVariables>
}
export const useDeletePin = (): DeletePinResult => {
	const result = useGQLMutation<World, DeletePinVariables>(DELETE_PIN);
	return {
		...result,
		deletePin: result.mutate
	};
};
