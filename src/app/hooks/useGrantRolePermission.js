import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const GRANT_ROLE_PERMISSION = gql`
	mutation grantRolePermission($userId: ID!, $permission: String!, $subjectId: ID){
		grantRolePermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;

export const useGrantRolePermission = () => {
	const [grantRolePermission, {data, loading, error}] = useMutation(GRANT_ROLE_PERMISSION);
	return {
		grantRolePermission: async (roleId, permission, subjectId) => {
			return await grantRolePermission({variables: {roleId, permission, subjectId}});
		},
		loading,
		subject: data ? data.grantRolePermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};