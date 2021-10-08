import gql from "graphql-tag";
import {ApiHookResponse} from "../types";
import {User} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const GET_CURRENT_USER = gql`
	query currentUser{
		currentUser {
			_id
			username
			email
			currentWorld {
				_id
				wikiPage {
					_id
				}
			}
			roles {
				_id
				name
			}
		}
	}
`;

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
