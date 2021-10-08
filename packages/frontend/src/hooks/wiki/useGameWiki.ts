import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import gql from "graphql-tag";
import { useGQLLazyQuery } from "../useGQLLazyQuery";

export const GAME_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	query wiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
		}
	}
`;

export default () => {
	return useGQLLazyQuery(GAME_WIKI);
};
