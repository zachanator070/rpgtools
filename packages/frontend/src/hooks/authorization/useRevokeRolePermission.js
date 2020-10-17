import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {PERMISSIONS_GRANTED} from "@rpgtools/common/src/gql-fragments";

export const REVOKE_ROLE_PERMISSION = gql`
	mutation revokeRolePermission($roleId: ID!, $permissionAssignmentId: ID!){
		revokeRolePermission(roleId: $roleId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${PERMISSIONS_GRANTED}
		}
	}
`;
export const useRevokeRolePermission = () => {
	const [revokeRolePermission, {data, loading, error}] = useMutation(REVOKE_ROLE_PERMISSION);
	return {
		revokeRolePermission: async (roleId, permissionAssignmentId) => {
			return await revokeRolePermission({variables: {roleId, permissionAssignmentId}});
		},
		loading,
		subject: data ? data.revokeRolePermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};