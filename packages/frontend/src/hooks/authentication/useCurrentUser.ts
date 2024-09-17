import {User} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_CURRENT_USER} from "@rpgtools/common/src/gql-queries.js";

interface CurrentUserResult extends GqlQueryResult<User> {
	currentUser: User;
}

export default function useCurrentUser(): CurrentUserResult {
	const result = useGQLQuery<User>(GET_CURRENT_USER);
	return {
		...result,
		currentUser: result.data
	};
};
