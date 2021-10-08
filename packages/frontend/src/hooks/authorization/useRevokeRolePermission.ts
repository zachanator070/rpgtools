import gql from "graphql-tag";
import { PERMISSIONS_GRANTED } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const REVOKE_ROLE_PERMISSION = gql`
	${PERMISSIONS_GRANTED}
	mutation revokeRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!){
		revokeRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId){
			_id
			...permissionsGranted		
		}
	}
`;

interface RevokeRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
}

interface RevokeRolePermissionResult extends GqlMutationResult<World, RevokeRolePermissionVariables> {
	revokeRolePermission: MutationMethod<World, RevokeRolePermissionVariables>;
}

export const useRevokeRolePermission = (): RevokeRolePermissionResult => {
	const result = useGQLMutation<World, RevokeRolePermissionVariables>(REVOKE_ROLE_PERMISSION);
	return {
		...result,
		revokeRolePermission: result.mutate
	};
};
