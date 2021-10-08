import { useQuery } from "@apollo/client";
import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import gql from "graphql-tag";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiPage} from "../../types";

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

interface MapWikiVariables {
	wikiId: string;
}

interface MapWikiResult extends GqlQueryResult<WikiPage, MapWikiVariables> {
	mapWiki: WikiPage
}
export default (): MapWikiResult => {
	const {
		data: { mapWiki },
	} = useGQLQuery<{mapWiki: string}>(MAP_WIKI_ID);
	const result = useGQLQuery<WikiPage, MapWikiVariables>(MAP_WIKI, {wikiId: mapWiki});

	return {
		...result,
		mapWiki: result.data
	};
};
