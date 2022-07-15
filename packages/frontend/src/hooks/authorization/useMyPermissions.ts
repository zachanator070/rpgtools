import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {useParams} from "react-router-dom";
import {PermissionAssignment} from "../../types";
import {MY_PERMISSIONS} from "@rpgtools/common/src/gql-queries";

interface MyPermissionsVariables {
	worldId: string;
}

interface MyPermissionsResult extends GqlQueryResult<PermissionAssignment[], MyPermissionsVariables>{
	myPermissions: PermissionAssignment[];
}

export default function useMyPermissions(): MyPermissionsResult {
	const params = useParams();
	const result = useGQLQuery<PermissionAssignment[], MyPermissionsVariables>(MY_PERMISSIONS, { worldId: params.world_id });
	return {
		...result,
		myPermissions: result.data
	};
};
