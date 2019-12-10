import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const LOGOUT_QUERY = gql`
    mutation {
        logout
    }
`;

const LOGIN_QUERY = gql`
    query {
        currentUser {
            _id
        }
    }
`;

export default () => {
	const [logout, {data, loading, error}] = useMutation(LOGOUT_QUERY, {
		update: async (cache, data) => {
			try {
				// we can't just refetch the user b/c we will get an unauthenticated error
				cache.writeQuery({query: LOGIN_QUERY, data: {currentUser: null}});
			} catch {
			}
		}
	});
	return {
		logout,
		result: data,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}

}