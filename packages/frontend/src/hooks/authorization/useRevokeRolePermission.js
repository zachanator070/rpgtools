import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { PERMISSIONS_GRANTED } from "../../../../common/src/gql-fragments";

export const REVOKE_ROLE_PERMISSION = gql`
	${PERMISSIONS_GRANTED}
	mutation revokeRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!){
		revokeRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId){
			_id
			...permissionsGranted		
		}
	}
`;
export const useRevokeRolePermission = () => {
	const [revokeRolePermission, { data, loading, error }] = useMutation(REVOKE_ROLE_PERMISSION);
	return {
		revokeRolePermission: async (roleId, permission, subjectId) => {
			return await revokeRolePermission({
				variables: { roleId, permission, subjectId },
			});
		},
		loading,
		subject: data ? data.revokeRolePermission : null,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
