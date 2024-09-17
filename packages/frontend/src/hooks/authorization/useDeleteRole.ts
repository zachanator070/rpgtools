import useCurrentUser from "../authentication/useCurrentUser.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {DELETE_ROLE} from "@rpgtools/common/src/gql-mutations.js";
import {GET_CURRENT_USER, SEARCH_ROLES} from "@rpgtools/common/src/gql-queries.js";

interface DeleteRoleVariables {
	roleId: string;
}

interface DeleteRoleResult extends GqlMutationResult<World, DeleteRoleVariables> {
	deleteRole: MutationMethod<World, DeleteRoleVariables>
}

export default function useDeleteRole(): DeleteRoleResult {
	useCurrentUser();
	const result = useGQLMutation<World, DeleteRoleVariables>(DELETE_ROLE, {}, {
		refetchQueries: [GET_CURRENT_USER, SEARCH_ROLES]
	});
	return {
		...result,
		deleteRole: result.mutate
	};
};
