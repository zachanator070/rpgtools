import useCurrentUser from "../authentication/useCurrentUser";
import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST, CURRENT_WORLD_ROLES } from "../gql-fragments";
import {ApiHookResponse} from "../types";
import {World} from "../../types";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";

export const CREATE_ROLE = gql`
	${ACCESS_CONTROL_LIST}
	${CURRENT_WORLD_ROLES}
	mutation createRole($worldId: ID!, $name: String!){
		createRole(worldId: $worldId, name: $name){
			_id
			...accessControlList
			...currentWorldRoles
		}
	}
`;

interface CreateRoleVariables {
	worldId: string;
	name: string;
}

interface CreateRoleResult extends ApiHookResponse<World>{
	createRole: MutationMethod<World, CreateRoleVariables>
}

export default (): CreateRoleResult => {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, CreateRoleVariables>(CREATE_ROLE, {}, {
		onCompleted: async () => refetch()
	});
	return {
		...result,
		createRole: result.mutate
	};
};
