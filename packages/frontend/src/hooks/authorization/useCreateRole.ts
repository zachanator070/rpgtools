import useCurrentUser from "../authentication/useCurrentUser";
import {ApiHookResponse} from "../types";
import {World} from "../../types";
import useGQLMutation, {MutationMethod} from "../useGQLMutation";
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
