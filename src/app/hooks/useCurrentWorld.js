import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

export const CURRENT_WORLD_PERMISSIONS = `
	permissions{
		_id
		permission
		subjectType
		subject {
			_id
			... on World{
				name
			}
			... on WikiPage{
				name
			}
			... on WikiFolder{
				name
			}
			... on Role{
				name
			}
		}
	}
`;

export const USERS_WITH_PERMISSIONS = `
	... on PermissionControlled{
		usersWithPermissions{
            _id
            username
            ${CURRENT_WORLD_PERMISSIONS}
        }
	}
    
`;

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


export const CURRENT_WORLD_ROLES = `
	roles{
		_id
		name
		canWrite
		world{
			_id
		}
		${CURRENT_WORLD_PERMISSIONS}
		members{
			_id
			username
		}
	}
`;

const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID!){
        world(worldId: $worldId){
			_id
			name
			canWrite
			canAddRoles
			wikiPage {
				_id
				name
			}
			rootFolder{
				${CURRENT_WORLD_FOLDERS}
			}
			${USERS_WITH_PERMISSIONS}
			${CURRENT_WORLD_ROLES}
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