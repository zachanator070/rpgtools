import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {GRANT_USER_PERMISSION} from "@rpgtools/common/src/gql-mutations";

interface GrantUserPermissionVariables {
	userId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantUserPermissionResult extends GqlMutationResult<World, GrantUserPermissionVariables> {
	grantUserPermission: MutationMethod<World, GrantUserPermissionVariables>;
}
export default function useGrantUserPermission({callback}: {callback: () => Promise<void>}): GrantUserPermissionResult {
	const result = useGQLMutation<World, GrantUserPermissionVariables>(GRANT_USER_PERMISSION, {}, {
		onCompleted: callback
	});
	return {
		...result,
		grantUserPermission: result.mutate
	};
};
