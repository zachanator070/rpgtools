import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const GRANT_USER_PERMISSION = gql`
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId){
			_id
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;

export const useGrantUserPermission = () => {
	const [grantUserPermission, {data, loading, error}] = useMutation(GRANT_USER_PERMISSION);
	return {
		grantUserPermission: async (userId, permission, subjectId) => {
			return await grantUserPermission({variables: {userId, permission, subjectId}});
		},
		loading,
		subject: data ? data.grantUserPermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};