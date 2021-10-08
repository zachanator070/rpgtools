import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {PermissionAssignment} from "../../types";

export const MY_PERMISSIONS = gql`
	query myPermissions($worldId: ID!) {
		myPermissions(worldId: $worldId) {
			_id
			permission
			subject {
				_id
				... on World {
					name
				}
				... on WikiPage {
					name
				}
				... on WikiFolder {
					name
				}
				... on Role {
					name
				}
			}
			subjectType
		}
	}
`;

interface MyPermissionsVariables {
	worldId: string;
}

interface MyPermissionsResult extends GqlQueryResult<PermissionAssignment[], MyPermissionsVariables>{
	myPermissions: PermissionAssignment[];
}

export const useMyPermissions = (): MyPermissionsResult => {
	const params = useParams();
	const result = useGQLQuery<PermissionAssignment[], MyPermissionsVariables>(MY_PERMISSIONS, { worldId: params.world_id });
	return {
		...result,
		myPermissions: result.data
	};
};
