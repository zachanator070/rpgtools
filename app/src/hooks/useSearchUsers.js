import {useLazyQuery} from "@apollo/react-hooks";
import {SEARCH_USERS} from "../../../common/src/gql-queries";

export const useSearchUsers = () => {
	const [searchUsers, {data, loading, error}] = useLazyQuery(SEARCH_USERS);
	return {
		searchUsers: async (username) => {return searchUsers({variables: {username}});},
		users: data ? data.users.docs : [],
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};