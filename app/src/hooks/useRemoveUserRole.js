import {useMutation} from "@apollo/react-hooks";
import {REMOVE_USER_ROLE} from "../../../common/src/gql-queries";

export default () => {
	const [removeUserRole, {loading, error, data}] = useMutation(REMOVE_USER_ROLE);
	return {
		removeUserRole: async (userId, roleId) => {
			await removeUserRole({variables: {userId, roleId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.removeUserRole : null
	}
}