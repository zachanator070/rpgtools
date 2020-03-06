import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_PERMISSIONS, CURRENT_WORLD_ROLES} from "./useCurrentWorld";

const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!){
		deleteRole(roleId: $roleId){
			_id
			${CURRENT_WORLD_ROLES}
			${CURRENT_WORLD_PERMISSIONS}
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