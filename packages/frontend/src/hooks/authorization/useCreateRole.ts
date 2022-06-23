import useCurrentUser from "../authentication/useCurrentUser";
import {ApiHookResponse} from "../types";
import {World} from "../../types";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {CREATE_ROLE} from "@rpgtools/common/src/gql-mutations";

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
