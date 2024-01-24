import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { REMOVE_USER_ROLE } from "@rpgtools/common/src/gql-mutations";
import { SEARCH_ROLES } from "@rpgtools/common/src/gql-queries";

interface RemoveUserRoleVariables {
	userId: string;
	roleId: string;
}

interface RemoveUserRoleData {
	removeUserRole: World;
}

interface RemoveUserRoleResult extends GqlMutationResult<World, RemoveUserRoleVariables> {
	removeUserRole: MutationMethod<World, RemoveUserRoleVariables>;
}

export default function useRemoveUserRole(): RemoveUserRoleResult {
	const result = useGQLMutation<World, RemoveUserRoleData, RemoveUserRoleVariables>(
		REMOVE_USER_ROLE,
		null,
		{
			refetchQueries: [SEARCH_ROLES],
		},
	);
	return {
		...result,
		removeUserRole: result.mutate,
	};
}
