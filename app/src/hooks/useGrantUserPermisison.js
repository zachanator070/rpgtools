import {useMutation} from "@apollo/client";
import {GRANT_USER_PERMISSION} from "../../../common/src/gql-queries";

export const useGrantUserPermission = () => {
	const [grantUserPermission, {data, loading, error}] = useMutation(GRANT_USER_PERMISSION);
	return {
		grantUserPermission: async (userId, permission, subjectId, subjectType) => {
			return await grantUserPermission({variables: {userId, permission, subjectId, subjectType}});
		},
		loading,
		subject: data ? data.grantUserPermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};