import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../../../../common/src/gql-fragments";

export const GRANT_USER_PERMISSION = gql`
	${ACCESS_CONTROL_LIST}
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...accessControlList		
		}
	}
`;
export const useGrantUserPermission = () => {
	const [grantUserPermission, { data, loading, error }] = useMutation(GRANT_USER_PERMISSION);
	return {
		grantUserPermission: async (userId, permission, subjectId, subjectType) => {
			return await grantUserPermission({
				variables: { userId, permission, subjectId, subjectType },
			});
		},
		loading,
		subject: data ? data.grantUserPermission : null,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
