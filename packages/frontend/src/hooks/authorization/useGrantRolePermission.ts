import gql from "graphql-tag";
import { PERMISSIONS_GRANTED } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const GRANT_ROLE_PERMISSION = gql`
	${PERMISSIONS_GRANTED}
	mutation grantRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...permissionsGranted
		}
	}
`;

interface GrantRolePermissionVariables {
	roleId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantRolePermissionResult extends GqlMutationResult<World, GrantRolePermissionVariables> {
	grantRolePermission: MutationMethod<World, GrantRolePermissionVariables>
}

export const useGrantRolePermission = (): GrantRolePermissionResult => {
	const result = useGQLMutation<World, GrantRolePermissionVariables>(GRANT_ROLE_PERMISSION);
	return {
		...result,
		grantRolePermission: result.mutate
	};
};
