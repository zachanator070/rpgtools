import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {DELETE_PIN} from "@rpgtools/common/src/gql-mutations.js";
import {GET_PINS} from "@rpgtools/common/src/gql-queries.js";

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
