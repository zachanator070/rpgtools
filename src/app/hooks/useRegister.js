import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const REGISTER_MUTATION = gql`
    mutation register($email: String!, $username: String!, $password: String!){
        register(email: $email, username: $username, password: $password){
            _id
        }
    }
`;

export default (callback) => {
	const [register, {data, loading, error}] = useMutation(REGISTER_MUTATION, {onCompleted: callback});
	return {
		register: async (email, username, password) => {await register({variables: {email, username, password}})},
		loading,
		user: data ? data.register : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}