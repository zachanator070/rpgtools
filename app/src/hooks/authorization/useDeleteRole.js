import {useMutation} from "@apollo/client";
import useCurrentUser from "../authentication/useCurrentUser";
import {DELETE_ROLE} from "../../../../common/src/gql-queries";

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