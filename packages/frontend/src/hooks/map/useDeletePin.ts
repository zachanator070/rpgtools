import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {DELETE_PIN} from "@rpgtools/common/src/gql-mutations";
import {GET_PINS} from "@rpgtools/common/src/gql-queries";

interface DeletePinVariables {
	pinId: string;
}

interface DeletePinResult extends GqlMutationResult<World, DeletePinVariables>{
	deletePin: MutationMethod<World, DeletePinVariables>
}
export default function useDeletePin(): DeletePinResult {
	const result = useGQLMutation<World, DeletePinVariables>(DELETE_PIN, {}, {refetchQueries: [GET_PINS]});
	return {
		...result,
		deletePin: result.mutate
	};
};
