import {useMutation} from "@apollo/react-hooks";
import useCurrentUser from "./useCurrentUser";
import {DELETE_ROLE} from "../../../common/src/gql-queries";

export default () => {
	const [deleteRole, {loading, error, data}] = useMutation(DELETE_ROLE);
	const {refetch} = useCurrentUser();
	return {
		deleteRole: async (roleId, name) => {
			await deleteRole({variables: {roleId, name}});
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.deleteRole : null
	}
}