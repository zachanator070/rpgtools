import gql from "graphql-tag";

export const GET_CURRENT_USER = gql`
	query {
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