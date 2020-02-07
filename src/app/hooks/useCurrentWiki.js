import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

const GET_CURRENT_WIKI = gql`
    query getWiki($wikiId: Int!){
        wiki(wikiId: $wikiId) {
            _id
            name
            content
            canWrite
            world {
                _id
            }
            coverImage {
                width
                height
                chunks{
                    _id
                }
            }
        }
    }
`;

export default () => {
	const {wiki_id} = useParams();
	const {data, loading, error} = useQuery(GET_CURRENT_WIKI, {variables: {wikiId: wiki_id}});
	return {
		currentWiki: data ? data.currentWiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}