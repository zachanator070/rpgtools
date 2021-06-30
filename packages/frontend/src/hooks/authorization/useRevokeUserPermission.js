import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../../../../common/src/gql-fragments";

export const REVOKE_USER_PERMISSION = gql`
	mutation revokeUserPermission($userId: ID!, $permission: String!, $subjectId: ID!){
		revokeUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			${ACCESS_CONTROL_LIST}
		}
	}
`;
export const useRevokeUserPermission = () => {
	const [revokeUserPermission, { data, loading, error }] = useMutation(REVOKE_USER_PERMISSION);
	return {
		revokeUserPermission: async (userId, permission, subjectId) => {
			return await revokeUserPermission({
				variables: { userId, permission, subjectId },
			});
		},
		loading,
		subject: data ? data.revokeUserPermission : null,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
