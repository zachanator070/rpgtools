import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {ApiHookResponse} from "../types.js";
import {ADD_USER_ROLE} from "@rpgtools/common/src/gql-mutations";
import {SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface AddUserRoleVariables {
	userId: string;
	roleId: string;
}

interface AddUserRoleResult extends ApiHookResponse<World> {
	addUserRole: MutationMethod<World, AddUserRoleVariables>
}

export default function useAddUserRole(): AddUserRoleResult {
	const result = useGQLMutation<World, AddUserRoleVariables>(ADD_USER_ROLE, {}, {
		refetchQueries: [SEARCH_ROLES]
	});
	return {
		...result,
		addUserRole: result.mutate
	};
};
