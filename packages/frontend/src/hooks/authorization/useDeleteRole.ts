import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { DELETE_ROLE } from "@rpgtools/common/src/gql-mutations";
import { GET_CURRENT_USER, SEARCH_ROLES } from "@rpgtools/common/src/gql-queries";

interface DeleteRoleVariables {
	roleId: string;
}

interface DeleteRoleData {
	deleteRole: World;
}

interface DeleteRoleResult extends GqlMutationResult<World, DeleteRoleVariables> {
	deleteRole: MutationMethod<World, DeleteRoleVariables>;
}

export default function useDeleteRole(): DeleteRoleResult {
	const result = useGQLMutation<World, DeleteRoleData, DeleteRoleVariables>(DELETE_ROLE, null, {
		refetchQueries: [GET_CURRENT_USER, SEARCH_ROLES],
	});
	return {
		...result,
		deleteRole: result.mutate,
	};
}
