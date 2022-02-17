import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WORLD_FOLDERS,
	CURRENT_WORLD_PINS,
	CURRENT_WORLD_ROLES,
} from "../gql-fragments";
import {World} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const GET_CURRENT_WORLD = gql`
	${CURRENT_WORLD_FOLDERS}
	${ACCESS_CONTROL_LIST}
	${CURRENT_WORLD_ROLES}
	${CURRENT_WORLD_PINS}
	query currentWorld($worldId: ID){
		world(worldId: $worldId){
			_id
			name
			canWrite
			canAdmin
			canAddRoles
			canHostGame
			canAddModels
			wikiPage {
				_id
				name
				mapImage {
					_id
					width
					height
					chunkWidth
					chunkHeight
					chunks {
						fileId
						x
						y
						width
						height
					}
				}
			}
			rootFolder{
				...currentWorldFolders
			}
			...accessControlList
			...currentWorldRoles
			...currentWorldPins
		}
	}
`;

interface CurrentWorldVariables {
	worldId: string;
}

interface CurrentWorldResult extends GqlQueryResult<World, CurrentWorldVariables>{
	currentWorld: World;
}

export default (): CurrentWorldResult => {
	const { world_id } = useParams();
	const result = useGQLQuery<World, CurrentWorldVariables>(GET_CURRENT_WORLD, {worldId: world_id});
	return {
		...result,
		currentWorld: result.data
	};
};
