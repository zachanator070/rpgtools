import useGQLMutation, { MutationMethod } from "../useGQLMutation";
import { World } from "../../types";
import { GQLResult } from "../types";
import { ADD_USER_ROLE } from "@rpgtools/common/src/gql-mutations";
import { SEARCH_ROLES } from "@rpgtools/common/src/gql-queries";

interface AddUserRoleVariables {
	userId: string;
	roleId: string;
}

interface AddUserData {
	addUserRole: World;
}

interface AddUserRoleResult extends GQLResult<World> {
	addUserRole: MutationMethod<World, AddUserRoleVariables>;
}

export default function useAddUserRole(): AddUserRoleResult {
	const result = useGQLMutation<World, AddUserData, AddUserRoleVariables>(ADD_USER_ROLE, null, {
		refetchQueries: [SEARCH_ROLES],
	});
	return {
		...result,
		addUserRole: result.mutate,
	};
}
