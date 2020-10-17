import {useMutation} from "@apollo/client";
import useCurrentUser from "../authentication/useCurrentUser";
import gql from "graphql-tag";
import {ACCESS_CONTROL_LIST, CURRENT_WORLD_ROLES} from "@rpgtools/common/src/gql-fragments";

export const CREATE_ROLE = gql`
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			${ACCESS_CONTROL_LIST}
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