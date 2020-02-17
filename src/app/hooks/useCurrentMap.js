import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

const GET_CURRENT_MAP = gql`
    query getWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            _id
            type
            name
            content
            canWrite
            ... on Place {
                mapImage {
	                _id
	                name
	                width
	                height
	                chunkWidth
	                chunkHeight
	                chunks{
	                    _id
	                    fileId
	                    width
	                    height
	                    x
	                    y
	                }
	            }
            }
        }
    }
`;

export default () => {
	const {map_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_MAP, {variables: {wikiId: map_id}});
	return {
		currentMap: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}