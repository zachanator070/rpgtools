import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {REVOKE_ROLE_PERMISSION} from "@rpgtools/common/src/gql-mutations";
import {GET_CURRENT_WORLD} from "@rpgtools/common/src/gql-queries";

interface RevokeRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
}

interface RevokeRolePermissionResult extends GqlMutationResult<World, RevokeRolePermissionVariables> {
	revokeRolePermission: MutationMethod<World, RevokeRolePermissionVariables>;
}

export const useRevokeRolePermission = (): RevokeRolePermissionResult => {
	const result = useGQLMutation<World, RevokeRolePermissionVariables>(REVOKE_ROLE_PERMISSION, {}, {
		refetchQueries: [GET_CURRENT_WORLD]
	});
	return {
		...result,
		revokeRolePermission: result.mutate
	};
};
