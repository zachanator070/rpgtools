import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_ROLES, USERS_WITH_PERMISSIONS} from "./useCurrentWorld";

const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!){
		deleteRole(roleId: $roleId){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;

export default () => {
	const [deleteRole, {loading, error, data}] = useMutation(DELETE_ROLE);
	return {
		deleteRole: async (roleId, name) => {
			await deleteRole({variables: {roleId, name}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.deleteRole : null
	}
}