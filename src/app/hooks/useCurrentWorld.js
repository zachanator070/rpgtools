import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

export const CURRENT_WORLD_WIKIS = `
	_id
	name
	type
	canWrite	
`;

export const CURRENT_WORLD_FOLDERS = `
	_id
	name
	canWrite
	children{
		_id
	}
	pages{
		${CURRENT_WORLD_WIKIS}
	}
`;

export const CURRENT_WORLD_PINS = `
	pins{
		_id
		canWrite
		page{
			name
			_id
		}
		map{
			name
			_id
		}
		x
		y
	}
`;

const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID!){
        world(worldId: $worldId){
			name
			_id
			wikiPage {
				_id
				name
			}
			rootFolder{
				${CURRENT_WORLD_FOLDERS}
			}
			roles{
				_id
				name
				world{
					_id
				}
				permissions{
					permission
					subjectId
				}
			}
			${CURRENT_WORLD_PINS}
			folders{
			    ${CURRENT_WORLD_FOLDERS}
		    }
	    }
    }
    
`;

export default () => {
	const {world_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_WORLD, {variables: {worldId: world_id}});
	return {
		currentWorld: data ? data.world : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}