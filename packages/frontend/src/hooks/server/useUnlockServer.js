import { useMutation } from "@apollo/client";
import gql from "graphql-tag";

export const UNLOCK_SERVER = gql`
	mutation unlockServer(
		$unlockCode: String!
		$email: String!
		$username: String!
		$password: String!
	) {
		unlockServer(
			unlockCode: $unlockCode
			email: $email
			username: $username
			password: $password
		)
	}
`;
export default (callback) => {
	const [unlockServer, { data, loading, error }] = useMutation(UNLOCK_SERVER, {
		onCompleted: callback,
	});
	return {
		unlockServer: async (unlockCode, email, username, password) => {
			await unlockServer({
				variables: { unlockCode, email, username, password },
			});
		},
		loading,
		user: data ? data.register : null,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
