import { useQuery } from "@apollo/client";
import { CURRENT_WIKI_ATTRIBUTES } from "../../../../common/src/gql-fragments";
import gql from "graphql-tag";

export const MAP_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	query mapWiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
		}
	}
`;
export const MAP_WIKI_ID = gql`
	query mapWIki{
		mapWiki @client
	}
`;
export default () => {
	const {
		data: { mapWiki },
	} = useQuery(MAP_WIKI_ID);
	const { data, loading, error } = useQuery(MAP_WIKI, {
		variables: { wikiId: mapWiki },
	});

	return {
		mapWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
