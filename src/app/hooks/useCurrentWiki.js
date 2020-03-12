import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';
import {USERS_WITH_PERMISSIONS} from "./useCurrentWorld";

export const CURRENT_WIKI_ATTRIBUTES = `
	_id
    type
    name
    content
    canWrite
    world {
        _id
    }
    coverImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
`;

export const CURRENT_WIKI_PLACE_ATTRIBUTES = `
	mapImage {
        _id
        name
        width
        height
        chunks{
            _id
            fileId
        }
        icon{
            _id
            chunks{
                _id
                fileId
            }
        }
    }
`;

const GET_CURRENT_WIKI = gql`
    query currentWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
            ${USERS_WITH_PERMISSIONS}
            ... on Place {
                ${CURRENT_WIKI_PLACE_ATTRIBUTES}
            }
            
        }
    }
`;

export default () => {
	const {wiki_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_WIKI, {variables: {wikiId: wiki_id}});
	return {
		currentWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}