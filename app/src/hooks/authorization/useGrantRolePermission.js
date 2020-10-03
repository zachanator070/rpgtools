import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {PERMISSIONS_GRANTED} from "../../../../common/src/gql-fragments";

export const GRANT_ROLE_PERMISSION = gql`
	mutation grantRolePermission($roleId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantRolePermission(roleId: $roleId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			${PERMISSIONS_GRANTED}
		}
	}
`;
export const useGrantRolePermission = () => {
	const [grantRolePermission, {data, loading, error}] = useMutation(GRANT_ROLE_PERMISSION);
	return {
		grantRolePermission: async (roleId, permission, subjectId, subjectType) => {
			return await grantRolePermission({variables: {roleId, permission, subjectId, subjectType}});
		},
		loading,
		subject: data ? data.grantRolePermission : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};