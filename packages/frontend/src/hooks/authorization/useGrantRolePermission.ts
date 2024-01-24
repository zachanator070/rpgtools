import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { GRANT_ROLE_PERMISSION } from "@rpgtools/common/src/gql-mutations";

interface GrantRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantRolePermission {
	grantRolePermission: World;
}

interface GrantRolePermissionResult extends GqlMutationResult<World, GrantRolePermissionVariables> {
	grantRolePermission: MutationMethod<World, GrantRolePermissionVariables>;
}

export default function useGrantRolePermission({
	callback,
}: {
	callback: () => Promise<void>;
}): GrantRolePermissionResult {
	const result = useGQLMutation<World, GrantRolePermission, GrantRolePermissionVariables>(
		GRANT_ROLE_PERMISSION,
		null,
		{
			onCompleted: callback,
		},
	);
	return {
		...result,
		grantRolePermission: result.mutate,
	};
}
