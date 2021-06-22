import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WORLD_FOLDERS,
	CURRENT_WORLD_PINS,
	CURRENT_WORLD_ROLES,
} from "../../../../common/src/gql-fragments";

export const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID){
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
				${CURRENT_WORLD_FOLDERS}
			}
			${ACCESS_CONTROL_LIST}
			${CURRENT_WORLD_ROLES}
			${CURRENT_WORLD_PINS}
		        
	    }
    }
    
`;
export default () => {
	const { world_id } = useParams();
	const { data, loading, error, refetch } = useQuery(GET_CURRENT_WORLD, {
		variables: { worldId: world_id },
	});
	return {
		currentWorld: data ? data.world : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
