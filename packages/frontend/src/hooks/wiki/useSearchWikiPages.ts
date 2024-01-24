import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { WikiPagePaginatedResult } from "../../types";
import { SEARCH_WIKIS } from "@rpgtools/common/src/gql-queries";
import { useParams } from "react-router-dom";

interface SearchWikiPagesVariables {
	name?: string;
	types?: string[];
	canAdmin?: boolean;
	page?: number;
	hasModel?: boolean;
}

interface QueryVariables extends SearchWikiPagesVariables {
	worldId: string;
}

interface SearchWikiPagesResult
	extends GqlQueryResult<WikiPagePaginatedResult, SearchWikiPagesVariables> {
	wikis: WikiPagePaginatedResult;
}

export default function useSearchWikiPages(
	variables: SearchWikiPagesVariables,
): SearchWikiPagesResult {
	if (!variables.page) {
		variables.page = 1;
	}
	const params = useParams();
	const result = useGQLQuery<WikiPagePaginatedResult, QueryVariables>(SEARCH_WIKIS, {
		worldId: params.world_id,
		...variables,
	});
	return {
		...result,
		wikis: result.data,
	};
}
