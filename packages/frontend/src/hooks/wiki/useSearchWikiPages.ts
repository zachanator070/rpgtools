import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";
import { MODEL_ATTRIBUTES } from "../gql-fragments";

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

export const useSearchWikiPages = (variables) => {
	return useGQLQuery(SEARCH_WIKIS, variables);
};
