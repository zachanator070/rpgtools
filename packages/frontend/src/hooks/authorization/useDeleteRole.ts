import useCurrentUser from "../authentication/useCurrentUser";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {DELETE_ROLE} from "@rpgtools/common/src/gql-mutations";

interface DeleteRoleVariables {
	roleId: string;
}

interface DeleteRoleResult extends GqlMutationResult<World, DeleteRoleVariables> {
	deleteRole: MutationMethod<World, DeleteRoleVariables>
}

export default (): DeleteRoleResult => {
	const { refetch } = useCurrentUser();
	const result = useGQLMutation<World, DeleteRoleVariables>(DELETE_ROLE, {}, {
		onCompleted: async () => refetch()
	});
	return {
		...result,
		deleteRole: result.mutate
	};
};
