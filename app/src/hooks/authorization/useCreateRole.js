import {useMutation} from "@apollo/client";
import useCurrentUser from "../authentication/useCurrentUser";
import {CREATE_ROLE} from "../../../../common/src/gql-queries";

export default () => {
	const [createRole, {loading, error, data}] = useMutation(CREATE_ROLE);
	const {refetch} = useCurrentUser();
	return {
		createRole: async (worldId, name) => {
			await createRole({variables: {worldId, name}});
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.createRole : null
	}
}