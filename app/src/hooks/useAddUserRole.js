import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_ROLES, USERS_WITH_PERMISSIONS} from "./useCurrentWorld";

const ADD_USER_ROLE = gql`
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;

export default () => {
	const [addUserRole, {loading, error, data}] = useMutation(ADD_USER_ROLE);
	return {
		addUserRole: async (userId, roleId) => {
			await addUserRole({variables: {userId, roleId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.addUserRole : null
	}
}