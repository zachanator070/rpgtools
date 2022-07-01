import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {ApiHookResponse} from "../types";
import {ADD_USER_ROLE} from "@rpgtools/common/src/gql-mutations";

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
