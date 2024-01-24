import { User } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { GET_CURRENT_USER } from "@rpgtools/common/src/gql-queries";

interface CurrentUserData {
	currentUser: User;
}

interface CurrentUserResult extends CurrentUserData, GqlQueryResult<User, CurrentUserData, void> {}

export default function useCurrentUser(): CurrentUserResult {
	const result = useGQLQuery<User, CurrentUserData, void>(GET_CURRENT_USER);
	return {
		...result,
		currentUser: result.data,
	};
}
