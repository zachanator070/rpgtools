import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_USERS_WITH_PERMISSIONS} from "./useCurrentWorld";

const GRANT_USER_PERMISSION = gql`
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			${CURRENT_WORLD_USERS_WITH_PERMISSIONS}
		}
	}
`;

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