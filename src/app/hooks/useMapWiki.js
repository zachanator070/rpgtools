
import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {CURRENT_WIKI_ATTRIBUTES, CURRENT_WIKI_PLACE_ATTRIBUTES} from "./useCurrentWiki";

const MAP_WIKI_ID = gql`
    query {
        mapWiki @client
    }
`;

const MAP_WIKI=gql`
	query currentWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
            ... on Place {
                ${CURRENT_WIKI_PLACE_ATTRIBUTES}
            }
        }
    }
`;

export default () => {

	const {data: mapWikiIdData} = useQuery(MAP_WIKI_ID);
	const {data, loading, error} = useQuery(MAP_WIKI, {variables: {wikiId: mapWikiIdData && mapWikiIdData.mapWiki}});

	return {
		mapWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}