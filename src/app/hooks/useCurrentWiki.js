import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

const GET_CURRENT_WIKI = gql`
    query getWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            _id
            type
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
		currentWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}