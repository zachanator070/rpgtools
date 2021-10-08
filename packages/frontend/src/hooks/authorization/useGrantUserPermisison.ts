import gql from "graphql-tag";
import { ACCESS_CONTROL_LIST } from "../gql-fragments";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const GRANT_USER_PERMISSION = gql`
	${ACCESS_CONTROL_LIST}
	mutation grantUserPermission($userId: ID!, $permission: String!, $subjectId: ID!, $subjectType: String!){
		grantUserPermission(userId: $userId, permission: $permission, subjectId: $subjectId, subjectType: $subjectType){
			_id
			...accessControlList		
		}
	}
`;

interface GrantUserPermissionVariables {
	userId: string;
	permission: string;
	subjectId: string;
	subjectType: string;
}

interface GrantUserPermissionResult extends GqlMutationResult<World, GrantUserPermissionVariables> {
	grantUserPermission: MutationMethod<World, GrantUserPermissionVariables>;
}
export const useGrantUserPermission = (): GrantUserPermissionResult => {
	const result = useGQLMutation<World, GrantUserPermissionVariables>(GRANT_USER_PERMISSION);
	return {
		...result,
		grantUserPermission: result.mutate
	};
};
