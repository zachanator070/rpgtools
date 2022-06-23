import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
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
export const useGrantUserPermission = (): GrantUserPermissionResult => {
	const result = useGQLMutation<World, GrantUserPermissionVariables>(GRANT_USER_PERMISSION);
	return {
		...result,
		grantUserPermission: result.mutate
	};
};
