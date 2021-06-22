import { useMutation } from "@apollo/client";
import useCurrentUser from "../authentication/useCurrentUser";
import gql from "graphql-tag";

export const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!) {
		deleteRole(roleId: $roleId) {
			_id
		}
	}
`;
export default () => {
	const [deleteRole, { loading, error, data }] = useMutation(DELETE_ROLE);
	const { refetch } = useCurrentUser();
	return {
		deleteRole: async (roleId, name) => {
			await deleteRole({ variables: { roleId, name } });
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		world: data ? data.deleteRole : null,
	};
};
