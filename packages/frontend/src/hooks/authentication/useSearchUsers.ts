import gql from "graphql-tag";
import {UserPaginatedResult} from "../../types";
import {GqlLazyHookResult, LazyHookFetch, useGQLLazyQuery} from "../useGQLLazyQuery";

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
interface SearchUsersVariables {
	username: string;
}

interface SearchUsersResult extends GqlLazyHookResult<UserPaginatedResult, SearchUsersVariables>{
	searchUsers: LazyHookFetch<SearchUsersVariables>,
	users: UserPaginatedResult
}
export const useSearchUsers = (): SearchUsersResult => {
	const result = useGQLLazyQuery<UserPaginatedResult, SearchUsersVariables>(SEARCH_USERS);
	return {
		...result,
		searchUsers: result.fetch,
		users: result.data
	};
};
