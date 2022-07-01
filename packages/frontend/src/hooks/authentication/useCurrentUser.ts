import {User} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {GET_CURRENT_USER} from "@rpgtools/common/src/gql-queries";

interface CurrentUserResult extends GqlQueryResult<User> {
	currentUser: User;
}

export default (): CurrentUserResult => {
	const result = useGQLQuery<User>(GET_CURRENT_USER);
	return {
		...result,
		currentUser: result.data
	};
};
