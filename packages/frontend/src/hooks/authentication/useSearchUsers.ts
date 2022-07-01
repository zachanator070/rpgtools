import {UserPaginatedResult} from "../../types";
import {GqlLazyHookResult, LazyHookFetch, useGQLLazyQuery} from "../useGQLLazyQuery";
import {SEARCH_USERS} from "@rpgtools/common/src/gql-queries";

interface SearchUsersVariables {
	username: string;
}

interface SearchUsersResult extends GqlLazyHookResult<UserPaginatedResult, SearchUsersVariables>{
	searchUsers: LazyHookFetch<UserPaginatedResult, SearchUsersVariables>,
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
