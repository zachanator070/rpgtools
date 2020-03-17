import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const REVOKE_ROLE_PERMISSION = gql`
	mutation revokeRolePermission($roleId: ID!, $permissionAssignmentId: ID!){
		revokeRolePermission(roleId: $roleId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
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