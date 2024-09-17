import {User} from "../../types";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {GET_CURRENT_USER} from "@rpgtools/common/src/gql-queries";

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
