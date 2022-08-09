import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {GRANT_ROLE_PERMISSION} from "@rpgtools/common/src/gql-mutations";
import {GET_CURRENT_WORLD, SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface GrantRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantRolePermissionResult extends GqlMutationResult<World, GrantRolePermissionVariables> {
	grantRolePermission: MutationMethod<World, GrantRolePermissionVariables>
}

export default function useGrantRolePermission({callback}: {callback?: () => Promise<void>}): GrantRolePermissionResult {
	const result = useGQLMutation<World, GrantRolePermissionVariables>(GRANT_ROLE_PERMISSION,{}, {
		onCompleted: callback,
		refetchQueries: [SEARCH_ROLES]
	});
	return {
		...result,
		grantRolePermission: result.mutate
	};
};
