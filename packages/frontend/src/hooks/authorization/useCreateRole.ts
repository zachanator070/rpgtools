import useCurrentUser from "../authentication/useCurrentUser";
import { GQLResult } from "../types";
import { World } from "../../types";
import useGQLMutation, { MutationMethod } from "../useGQLMutation";
import { CREATE_ROLE } from "@rpgtools/common/src/gql-mutations";
import { SEARCH_ROLES } from "@rpgtools/common/src/gql-queries";

interface CreateRoleVariables {
	worldId: string;
	name: string;
}

interface CreateRoleData {
	createRole: World;
}

interface CreateRoleResult extends GQLResult<World> {
	createRole: MutationMethod<World, CreateRoleVariables>;
}

export default function useCreateRole(): CreateRoleResult {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, CreateRoleData, CreateRoleVariables>(CREATE_ROLE, null, {
		onCompleted: async () => refetch(),
		refetchQueries: [SEARCH_ROLES],
	});
	return {
		...result,
		createRole: result.mutate,
	};
}
