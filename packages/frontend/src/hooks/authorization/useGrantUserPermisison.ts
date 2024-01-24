import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { GRANT_USER_PERMISSION } from "@rpgtools/common/src/gql-mutations";

interface GrantUserPermissionVariables {
	userId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantUserPermissionData {
	grantUserPermission: World;
}

interface GrantUserPermissionResult extends GqlMutationResult<World, GrantUserPermissionVariables> {
	grantUserPermission: MutationMethod<World, GrantUserPermissionVariables>;
}
export default function useGrantUserPermission({
	callback,
}: {
	callback: () => Promise<void>;
}): GrantUserPermissionResult {
	const result = useGQLMutation<World, GrantUserPermissionData, GrantUserPermissionVariables>(
		GRANT_USER_PERMISSION,
		null,
		{
			onCompleted: callback,
		},
	);
	return {
		...result,
		grantUserPermission: result.mutate,
	};
}
