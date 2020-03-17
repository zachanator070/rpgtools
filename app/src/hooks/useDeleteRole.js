import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_ROLES, USERS_WITH_PERMISSIONS} from "./useCurrentWorld";
import useCurrentUser from "./useCurrentUser";

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
	const {refetch} = useCurrentUser();
	return {
		deleteRole: async (roleId, name) => {
			await deleteRole({variables: {roleId, name}});
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.deleteRole : null
	}
}