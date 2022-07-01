import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiPagePaginatedResult} from "../../types";
import {SEARCH_WIKIS} from "@rpgtools/common/src/gql-queries";

interface SearchWikiPagesVariables {
	worldId: string;
	name?: string;
	types: string[];
	canAdmin: boolean;
}

interface SearchWikiPagesResult extends GqlQueryResult<WikiPagePaginatedResult, SearchWikiPagesVariables>{
	wikis: WikiPagePaginatedResult;
}

export const useSearchWikiPages = (variables: SearchWikiPagesVariables): SearchWikiPagesResult => {
	const result = useGQLQuery<WikiPagePaginatedResult, SearchWikiPagesVariables>(SEARCH_WIKIS, variables);
	return {
		...result,
		wikis: result.data
	};
};
