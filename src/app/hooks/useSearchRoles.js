import {useLazyQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SEARCH_ROLES = gql`
	query searchRoles($name: String!){
		roles(name: $name){
			_id
			name
		}
	}
`;

export const useSearchRoles = () => {
	const [searchRoles, {data, loading, error}] = useLazyQuery(SEARCH_ROLES);
	return {
		searchRoles: async (name) => {return searchRoles({variables: {name}});},
		roles: data ? data.roles : [],
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};