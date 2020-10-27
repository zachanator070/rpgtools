import { useQuery } from "@apollo/client";
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
export default () => {
	const { data: currentUserData, loading, error, refetch } = useQuery(
		GET_CURRENT_USER
	);
	return {
		currentUser: currentUserData ? currentUserData.currentUser : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
