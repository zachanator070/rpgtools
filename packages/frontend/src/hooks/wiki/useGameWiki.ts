import useGQLLazyQuery, {GqlLazyHookResult} from "../useGQLLazyQuery.js";
import {WikiPage} from "../../types.js";
import {GAME_WIKI} from "@rpgtools/common/src/gql-queries.js";

interface GameWikiVariables {
	wikiId: string;
}

interface GameWikiResult extends GqlLazyHookResult<WikiPage, GameWikiVariables>{
	wiki: WikiPage;
}

export default function useGameWiki(): GameWikiResult {

	const result = useGQLLazyQuery<WikiPage, GameWikiVariables>(GAME_WIKI);
	return {
		...result,
		wiki: result.data
	};
};
