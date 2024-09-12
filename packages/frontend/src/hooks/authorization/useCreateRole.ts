import useCurrentUser from "../authentication/useCurrentUser.js";
import {ApiHookResponse} from "../types.js";
import {World} from "../../types.js";
import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {CREATE_ROLE} from "@rpgtools/common/src/gql-mutations";
import {SEARCH_ROLES} from "@rpgtools/common/src/gql-queries";

interface CreateRoleVariables {
	worldId: string;
	name: string;
}

interface CreateRoleResult extends ApiHookResponse<World>{
	createRole: MutationMethod<World, CreateRoleVariables>
}

export default function useCreateRole(): CreateRoleResult {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, CreateRoleVariables>(CREATE_ROLE, {}, {
		onCompleted: async () => refetch(),
		refetchQueries: [SEARCH_ROLES]
	});
	return {
		...result,
		createRole: result.mutate
	};
};
