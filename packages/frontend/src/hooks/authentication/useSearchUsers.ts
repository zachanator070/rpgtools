import {UserPaginatedResult} from "../../types.js";
import useGQLLazyQuery, {GqlLazyHookResult, LazyHookFetch} from "../useGQLLazyQuery.js";
import {SEARCH_USERS} from "@rpgtools/common/src/gql-queries.js";

interface SearchUsersVariables {
	username: string;
}

interface SearchUsersResult extends GqlLazyHookResult<UserPaginatedResult, SearchUsersVariables>{
	searchUsers: LazyHookFetch<UserPaginatedResult, SearchUsersVariables>,
	users: UserPaginatedResult
}
export default function useSearchUsers(): SearchUsersResult {
	const result = useGQLLazyQuery<UserPaginatedResult, SearchUsersVariables>(SEARCH_USERS);
	return {
		...result,
		searchUsers: result.fetch,
		users: result.data
	};
};
