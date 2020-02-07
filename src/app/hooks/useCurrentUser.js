import {useQuery} from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_CURRENT_USER = gql`
    query {
        currentUser {
            _id
            username
            email
            currentWorld{
                _id
                wikiPage {
                    _id
                }
            }
        }
    }
`;

export default () => {
	const {data: currentUserData, loading, error, refetch} = useQuery(GET_CURRENT_USER);
	return {
		currentUser: currentUserData ? currentUserData.currentUser : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	}
}