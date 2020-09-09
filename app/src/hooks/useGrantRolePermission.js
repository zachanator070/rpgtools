import {useMutation} from "@apollo/client";
import {GRANT_ROLE_PERMISSION} from "../../../common/src/gql-queries";

export const useGrantRolePermission = () => {
	const [grantRolePermission, {data, loading, error}] = useMutation(GRANT_ROLE_PERMISSION);
	return {
		grantRolePermission: async (roleId, permission, subjectId, subjectType) => {
			return await grantRolePermission({variables: {roleId, permission, subjectId, subjectType}});
		},
		loading,
		subject: data ? data.grantRolePermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};