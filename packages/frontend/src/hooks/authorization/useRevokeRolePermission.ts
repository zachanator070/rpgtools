import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {REVOKE_ROLE_PERMISSION} from "@rpgtools/common/src/gql-mutations";
import {GET_CURRENT_WORLD, SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface RevokeRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
}

interface RevokeRolePermissionResult extends GqlMutationResult<World, RevokeRolePermissionVariables> {
	revokeRolePermission: MutationMethod<World, RevokeRolePermissionVariables>;
}

export default function useRevokeRolePermission({callback}: {callback?: () => Promise<void>}): RevokeRolePermissionResult {
	const result = useGQLMutation<World, RevokeRolePermissionVariables>(REVOKE_ROLE_PERMISSION, {}, {
		onCompleted: callback,
		refetchQueries: [SEARCH_ROLES]
	});
	return {
		...result,
		revokeRolePermission: result.mutate
	};
};
