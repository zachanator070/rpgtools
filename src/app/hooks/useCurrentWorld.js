import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";

const GET_CURRENT_WORLD = gql`
    query {
        currentWorld{
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
				}
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
	    }
    }
`;

export default () => {
	const {data, loading, error} = useQuery(GET_CURRENT_WORLD);
	return {
		currentWorld: data ? data.currentWorld : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}