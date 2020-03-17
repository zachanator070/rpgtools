import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_PERMISSIONS, CURRENT_WORLD_ROLES, USERS_WITH_PERMISSIONS} from "./useCurrentWorld";
import useCurrentUser from "./useCurrentUser";

const CREATE_ROLE = gql`
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
		}
	}
`;

export default () => {
	const [createRole, {loading, error, data}] = useMutation(CREATE_ROLE);
	const {refetch} = useCurrentUser();
	return {
		createRole: async (worldId, name) => {
			await createRole({variables: {worldId, name}});
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.createRole : null
	}
}