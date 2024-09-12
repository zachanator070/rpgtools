import useCurrentUser from "../authentication/useCurrentUser.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {DELETE_ROLE} from "@rpgtools/common/src/gql-mutations";
import {GET_CURRENT_USER, GET_CURRENT_WORLD, SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface DeleteRoleVariables {
	roleId: string;
}

interface DeleteRoleResult extends GqlMutationResult<World, DeleteRoleVariables> {
	deleteRole: MutationMethod<World, DeleteRoleVariables>
}

export default function useDeleteRole(): DeleteRoleResult {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, DeleteRoleVariables>(DELETE_ROLE, {}, {
		refetchQueries: [GET_CURRENT_USER, SEARCH_ROLES]
	});
	return {
		...result,
		deleteRole: result.mutate
	};
};
