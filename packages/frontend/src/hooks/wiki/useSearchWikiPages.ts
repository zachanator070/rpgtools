import gql from "graphql-tag";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import { MODEL_ATTRIBUTES } from "../gql-fragments";
import {WikiPagePaginatedResult} from "../../types";

const SEARCH_WIKIS = gql`
	${MODEL_ATTRIBUTES}
	query wikis($worldId: ID!, $name: String, $types: [String!], $canAdmin: Boolean){
		wikis(worldId: $worldId, name: $name, types: $types, canAdmin: $canAdmin){
			docs{
				_id
				name
				... on ModeledWiki {
					model{
						...modelAttributes
					}
					modelColor
				}
				... on PermissionControlled{
					canAdmin
				}
			}
			nextPage
		}
	}
`;
interface SearchWikiPagesVariables {
	worldId: string;
	name: string;
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
