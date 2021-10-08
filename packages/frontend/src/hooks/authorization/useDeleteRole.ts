import useCurrentUser from "../authentication/useCurrentUser";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const DELETE_ROLE = gql`
	mutation deleteRole($roleId: ID!) {
		deleteRole(roleId: $roleId) {
			_id
		}
	}
`;

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
