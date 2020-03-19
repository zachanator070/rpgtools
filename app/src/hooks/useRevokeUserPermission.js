import {useMutation} from "@apollo/react-hooks";
import {REVOKE_USER_PERMISSION} from "../../../common/src/gql-queries";

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