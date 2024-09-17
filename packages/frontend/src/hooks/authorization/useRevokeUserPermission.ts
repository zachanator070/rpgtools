import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {REVOKE_USER_PERMISSION} from "@rpgtools/common/src/gql-mutations";

interface RevokeUserPermissionVariables {
	userId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface RevokeUserPermissionResult extends GqlMutationResult<World, RevokeUserPermissionVariables>{
	revokeUserPermission: MutationMethod<World, RevokeUserPermissionVariables>
}

export default function useRevokeUserPermission({callback}: {callback: () => Promise<void>}): RevokeUserPermissionResult {
	const result = useGQLMutation<World, RevokeUserPermissionVariables>(REVOKE_USER_PERMISSION, {}, {
		onCompleted: callback
	});
	return {
		...result,
		revokeUserPermission: result.mutate
	};
};
