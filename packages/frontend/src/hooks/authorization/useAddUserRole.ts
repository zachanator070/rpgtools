import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST, CURRENT_WORLD_ROLES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {ApiHookResponse} from "../types";

export const ADD_USER_ROLE = gql`
	${ACCESS_CONTROL_LIST}
	${CURRENT_WORLD_ROLES}
	mutation addUserRole($userId: ID!, $roleId: ID!){
		addUserRole(userId: $userId, roleId: $roleId){
			_id
			...accessControlList
			...currentWorldRoles		
		}
	}
`;

interface AddUserRoleVariables {
	userId: string;
	roleId: string;
}

interface AddUserRoleResult extends ApiHookResponse<World> {
	addUserRole: MutationMethod<World, AddUserRoleVariables>
}

export default (): AddUserRoleResult => {
	const result = useGQLMutation<World, AddUserRoleVariables>(ADD_USER_ROLE, {});
	return {
		...result,
		addUserRole: result.mutate
	};
};
