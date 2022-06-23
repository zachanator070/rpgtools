import {GqlLazyHookResult, useGQLLazyQuery} from "../useGQLLazyQuery";
import {WikiPage} from "../../types";
import {GAME_WIKI} from "@rpgtools/common/src/gql-queries";

interface GameWikiVariables {
	wikiId: string;
}

interface GameWikiResult extends GqlLazyHookResult<WikiPage, GameWikiVariables>{
	wiki: WikiPage;
}

export default (): GameWikiResult => {

	const result = useGQLLazyQuery<WikiPage, GameWikiVariables>(GAME_WIKI);
	return {
		...result,
		wiki: result.data
	};
};
