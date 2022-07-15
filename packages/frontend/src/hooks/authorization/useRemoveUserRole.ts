import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {REMOVE_USER_ROLE} from "@rpgtools/common/src/gql-mutations";

interface RemoveUserRoleVariables {
	userId: string;
	roleId: string;
}

interface RemoveUserRoleResult extends GqlMutationResult<World, RemoveUserRoleVariables> {
	removeUserRole: MutationMethod<World, RemoveUserRoleVariables>;
}

export default function useRemoveUserRole(): RemoveUserRoleResult {
	const result = useGQLMutation<World, RemoveUserRoleVariables>(REMOVE_USER_ROLE);
	return {
		...result,
		removeUserRole: result.mutate
	};
};
