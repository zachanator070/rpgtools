import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {MAP_WIKI} from "../../../common/src/gql-queries";

const MAP_WIKI_ID = gql`
    query {
        mapWiki @client
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