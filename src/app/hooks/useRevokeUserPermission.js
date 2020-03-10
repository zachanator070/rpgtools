import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permissionId: ID!){
		revokeUserPermission(userId: $userId, permissionId: $permissionId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;

export const useRevokeUserPermission = () => {
	const [revokeUserPermission, {data, loading, error}] = useMutation(REVOKE_USER_PERMISSION);
	return {
		revokeUserPermission: async (userId, permissionId) => {
			return await revokeUserPermission({variables: {userId, permissionId}});
		},
		loading,
		subject: data ? data.revokeUserPermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};