import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
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

export default function useGrantRolePermission({callback}: {callback: () => Promise<void>}): GrantRolePermissionResult {
	const result = useGQLMutation<World, GrantRolePermissionVariables>(GRANT_ROLE_PERMISSION,{}, {
		onCompleted: callback,
	});
	return {
		...result,
		grantRolePermission: result.mutate
	};
};
