import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {GRANT_ROLE_PERMISSION} from "@rpgtools/common/src/gql-mutations";

interface GrantRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantRolePermissionResult extends GqlMutationResult<World, GrantRolePermissionVariables> {
	grantRolePermission: MutationMethod<World, GrantRolePermissionVariables>
}

export const useGrantRolePermission = (): GrantRolePermissionResult => {
	const result = useGQLMutation<World, GrantRolePermissionVariables>(GRANT_ROLE_PERMISSION);
	return {
		...result,
		grantRolePermission: result.mutate
	};
};
