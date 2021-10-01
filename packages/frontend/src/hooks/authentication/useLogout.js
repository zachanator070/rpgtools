import { useApolloClient, useMutation } from "@apollo/client";
import gql from "graphql-tag";

export const LOGOUT_QUERY = gql`
	mutation logout{
		logout
	}
`;
export default () => {
	const client = useApolloClient();

	const [logout, { data, loading, error }] = useMutation(LOGOUT_QUERY, {
		update: async (cache, data) => {
			// cache.writeQuery({query: LOGIN_QUERY, data: {currentUser: null}});
			await client.resetStore();
		},
	});
	return {
		logout,
		result: data,
		loading: loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
