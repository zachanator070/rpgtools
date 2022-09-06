import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {WikiPagePaginatedResult} from "../../types";
import {SEARCH_WIKIS} from "@rpgtools/common/src/gql-queries";

interface SearchWikiPagesVariables {
	worldId: string;
	name?: string;
	types: string[];
	canAdmin?: boolean;
	page?: number;
	hasModel?: boolean;
}

interface SearchWikiPagesResult extends GqlQueryResult<WikiPagePaginatedResult, SearchWikiPagesVariables>{
	wikis: WikiPagePaginatedResult;
}

export default function useSearchWikiPages(variables: SearchWikiPagesVariables): SearchWikiPagesResult {
	if (!variables.page) {
		variables.page = 1;
	}
	const result = useGQLQuery<WikiPagePaginatedResult, SearchWikiPagesVariables>(SEARCH_WIKIS, variables);
	return {
		...result,
		wikis: result.data
	};
};
