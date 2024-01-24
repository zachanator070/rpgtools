import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { REVOKE_ROLE_PERMISSION } from "@rpgtools/common/src/gql-mutations";

interface RevokeRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface RevokeRolePermissionData {
	revokeRolePermission: World;
}
interface RevokeRolePermissionResult
	extends GqlMutationResult<World, RevokeRolePermissionVariables> {
	revokeRolePermission: MutationMethod<World, RevokeRolePermissionVariables>;
}

export default function useRevokeRolePermission({
	callback,
}: {
	callback: () => Promise<void>;
}): RevokeRolePermissionResult {
	const result = useGQLMutation<World, RevokeRolePermissionData, RevokeRolePermissionVariables>(
		REVOKE_ROLE_PERMISSION,
		null,
		{
			onCompleted: callback,
		},
	);
	return {
		...result,
		revokeRolePermission: result.mutate,
	};
}
