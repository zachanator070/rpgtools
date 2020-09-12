import {useMutation} from "@apollo/client";
import {REVOKE_ROLE_PERMISSION} from "../../../../common/src/gql-queries";

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