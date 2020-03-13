import {useLazyQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";
import useCurrentWorld from "./useCurrentWorld";

const SEARCH_ROLES = gql`
	query searchRoles($worldId: ID!, $name: String!){
		roles(worldId: $worldId, name: $name){
			page
			totalPages
			docs{
				_id
				name
			}
		}
	}
`;

export const useSearchRoles = () => {
	const [searchRoles, {data, loading, error}] = useLazyQuery(SEARCH_ROLES);
	const {currentWorld} = useCurrentWorld();
	return {
		searchRoles: async (name) => {return searchRoles({variables: {worldId: currentWorld._id, name}});},
		roles: data ? data.roles.docs : [],
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};