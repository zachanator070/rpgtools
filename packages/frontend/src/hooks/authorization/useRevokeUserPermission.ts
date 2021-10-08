import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const REVOKE_USER_PERMISSION = gql`
	${ACCESS_CONTROL_LIST}
	mutation revokeUserPermission($userId: ID!, $permission: String!, $subjectId: ID!){
		revokeUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			...accessControlList
		}
	}
`;

interface RevokeUserPermissionVariables {
	userId: string;
	permission: string;
	subjectId: string;
}

interface RevokeUserPermissionResult extends GqlMutationResult<World, RevokeUserPermissionVariables>{
	revokeUserPermission: MutationMethod<World, RevokeUserPermissionVariables>
}

export const useRevokeUserPermission = (): RevokeUserPermissionResult => {
	const result = useGQLMutation<World, RevokeUserPermissionVariables>(REVOKE_USER_PERMISSION);
	return {
		...result,
		revokeUserPermission: result.mutate
	};
};
