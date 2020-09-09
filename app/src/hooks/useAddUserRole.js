import {useMutation} from "@apollo/client";
import {ADD_USER_ROLE} from "../../../common/src/gql-queries";

export default () => {
	const [addUserRole, {loading, error, data}] = useMutation(ADD_USER_ROLE);
	return {
		addUserRole: async (userId, roleId) => {
			await addUserRole({variables: {userId, roleId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.addUserRole : null
	}
}