import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

const GET_CURRENT_WORLD = gql`
    query getCurrentWorld($worldId: ID!){
        world(worldId: $worldId){
			name
			_id
			wikiPage {
				name
				_id
			}
			rootFolder{
				_id
				name
				children{
					_id
				}
				pages{
					_id
					name
					type
					canWrite
				}
				canWrite
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
			pins{
				_id
				canWrite
				page{
					_id
				}
				map{
					_id
				}
				x
				y
			}
			folders{
			    _id
			    canWrite
			    name
			    children{
			      _id
			    }
			    pages{
			      _id
			      name
			      type
			      canWrite
			    }
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