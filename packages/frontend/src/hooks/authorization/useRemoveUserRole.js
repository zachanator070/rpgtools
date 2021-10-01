import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { CURRENT_WORLD_ROLES } from "../../../../common/src/gql-fragments";

export const REMOVE_USER_ROLE = gql`
	${CURRENT_WORLD_ROLES}
	mutation removeUserRole($userId: ID!, $roleId: ID!){
		removeUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles
		}
	}
`;
export default () => {
	const [removeUserRole, { loading, error, data }] = useMutation(REMOVE_USER_ROLE);
	return {
		removeUserRole: async (userId, roleId) => {
			await removeUserRole({ variables: { userId, roleId } });
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		world: data ? data.removeUserRole : null,
	};
};
