import {useApolloClient, useMutation} from "@apollo/client";
import {LOGIN_QUERY} from "@rpgtools/common/src/mutations";

export default (callback) => {
	const client = useApolloClient();
	const [login, { loading, error }] = useMutation(LOGIN_QUERY, {
		async update(cache, { data }) {
			await client.resetStore();
		},
		onCompleted: callback,
	});
	return {
		login: async (username, password) =>
			await login({ variables: { username, password } }),
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
