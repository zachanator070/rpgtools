import {useApolloClient, useMutation} from "@apollo/react-hooks";
import {LOGOUT_QUERY} from "../../../common/src/gql-queries";

export default () => {

	const client = useApolloClient();

	const [logout, {data, loading, error}] = useMutation(LOGOUT_QUERY, {
		update: async (cache, data) => {
			// cache.writeQuery({query: LOGIN_QUERY, data: {currentUser: null}});
			await client.resetStore();
		}
	});
	return {
		logout,
		result: data,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}

}