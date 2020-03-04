import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permission: String!, $subjectId: ID){
		revokeUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;

export const useRevokeUserPermission = () => {
	const [revokeUserPermission, {data, loading, error}] = useMutation(REVOKE_USER_PERMISSION);
	return {
		revokeUserPermission: async (userId, permission, subjectId) => {
			return await revokeUserPermission({variables: {userId, permission, subjectId}});
		},
		loading,
		subject: data ? data.revokeUserPermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};