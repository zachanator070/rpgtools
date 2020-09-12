import {useMutation} from "@apollo/client";
import {UNLOCK_SERVER} from "../../../../common/src/gql-queries";

export default (callback) => {
	const [unlockServer, {data, loading, error}] = useMutation(UNLOCK_SERVER, {onCompleted: callback});
	return {
		unlockServer: async (unlockCode, email, username, password) => {await unlockServer({variables: {unlockCode, email, username, password}})},
		loading,
		user: data ? data.register : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}