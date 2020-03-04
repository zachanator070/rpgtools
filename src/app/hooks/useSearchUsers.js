import {useLazyQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SEARCH_USERS = gql`
	query searchUsers($username: String!){
		users(username: $username){
			_id
			username
		}
	}
`;

export const useSearchUsers = () => {
	const [searchUsers, {data, loading, error}] = useLazyQuery(SEARCH_USERS);
	return {
		searchUsers: async (username) => {return searchUsers({variables: {username}});},
		users: data ? data.users : [],
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};