import gql from "graphql-tag";
import { CURRENT_WORLD_ROLES } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const REMOVE_USER_ROLE = gql`
	${CURRENT_WORLD_ROLES}
	mutation removeUserRole($userId: ID!, $roleId: ID!){
		removeUserRole(userId: $userId, roleId: $roleId){
			_id
			...currentWorldRoles
		}
	}
`;

interface RemoveUserRoleVariables {
	userId: string;
	roleId: string;
}

interface RemoveUserRoleResult extends GqlMutationResult<World, RemoveUserRoleVariables> {
	removeUserRole: MutationMethod<World, RemoveUserRoleVariables>;
}

export default (): RemoveUserRoleResult => {
	const result = useGQLMutation<World, RemoveUserRoleVariables>(REMOVE_USER_ROLE);
	return {
		...result,
		removeUserRole: result.mutate
	};
};
