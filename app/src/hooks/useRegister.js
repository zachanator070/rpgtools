import {useMutation} from "@apollo/react-hooks";
import {REGISTER_MUTATION} from "../../../common/src/gql-queries";

export default (callback) => {
	const [register, {data, loading, error}] = useMutation(REGISTER_MUTATION, {onCompleted: callback});
	return {
		register: async (registerCode, email, username, password) => {await register({variables: {registerCode, email, username, password}})},
		loading,
		user: data ? data.register : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}