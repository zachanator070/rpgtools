import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {USERS_WITH_PERMISSIONS} from "./useCurrentWorld";

const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permissionAssignmentId: ID!){
		revokeUserPermission(userId: $userId, permissionAssignmentId: $permissionAssignmentId){
			_id
			${USERS_WITH_PERMISSIONS}
		}
	}
`;

export const useRevokeUserPermission = () => {
	const [revokeUserPermission, {data, loading, error}] = useMutation(REVOKE_USER_PERMISSION);
	return {
		revokeUserPermission: async (userId, permissionAssignmentId) => {
			return await revokeUserPermission({variables: {userId, permissionAssignmentId}});
		},
		loading,
		subject: data ? data.revokeUserPermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};