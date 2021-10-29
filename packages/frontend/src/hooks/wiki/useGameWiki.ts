import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import gql from "graphql-tag";
import { useGQLLazyQuery } from "../useGQLLazyQuery";
import {WikiPage} from "../../types";

export const GAME_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	query wiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
		}
	}
`;

interface GameWikiVariables {
	wikiId: string;
}

interface GameWikiResult {
	wiki: WikiPage;
}

export default (): GameWikiResult => {

	const result = useGQLLazyQuery<WikiPage, GameWikiVariables>(GAME_WIKI);
	return {
		...result,
		wiki: result.data
	};
};
