import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import {CURRENT_WORLD_PERMISSIONS, CURRENT_WORLD_ROLES} from "./useCurrentWorld";

const CREATE_ROLE = gql`
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			${CURRENT_WORLD_ROLES}
			${CURRENT_WORLD_PERMISSIONS}
		}
	}
`;

export default () => {
	const [createRole, {loading, error, data}] = useMutation(CREATE_ROLE);
	return {
		createRole: async (worldId, name) => {
			await createRole({variables: {worldId, name}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.createRole : null
	}
}