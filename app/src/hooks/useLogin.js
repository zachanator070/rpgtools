import {useApolloClient, useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

export const LOGIN_QUERY = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password){
            _id
        }
    }
`;

export default (callback) => {
	const client = useApolloClient();
	const [login, {loading, error}] = useMutation(LOGIN_QUERY, {
		async update(cache, {data}) {
			await client.resetStore();
		},
		onCompleted: callback
	});
	return {
		login: async(username, password) =>	await login({variables: {username, password}}),
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}