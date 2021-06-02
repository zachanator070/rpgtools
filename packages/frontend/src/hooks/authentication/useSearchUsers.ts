import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";

export const SEARCH_USERS = gql`
	query searchUsers($username: String!) {
		users(username: $username) {
			page
			totalPages
			docs {
				_id
				username
			}
		}
	}
`;
export const useSearchUsers = () => {
	const [searchUsers, { data, loading, error }] = useLazyQuery(SEARCH_USERS);
	return {
		searchUsers: async (username) => {
			return searchUsers({ variables: { username } });
		},
		users: data ? data.users.docs : [],
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
