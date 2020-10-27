import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WORLD_ROLES,
} from "@rpgtools/common/src/gql-fragments";

export const ADD_USER_ROLE = gql`
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			${ACCESS_CONTROL_LIST}
			${CURRENT_WORLD_ROLES}
		}
	}
`;
export default () => {
	const [addUserRole, { loading, error, data }] = useMutation(ADD_USER_ROLE);
	return {
		addUserRole: async (userId, roleId) => {
			await addUserRole({ variables: { userId, roleId } });
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		world: data ? data.addUserRole : null,
	};
};
