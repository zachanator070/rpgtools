import gql from "graphql-tag";
import {useGQLQuery} from "../useGQLQuery";
import {MODEL_ATTRIBUTES} from "@rpgtools/common/src/gql-fragments";

const SEARCH_WIKIS = gql`
	query wikis($worldId: ID!, $name: String, $types: [String!]){
		wikis(worldId: $worldId, name: $name, types: $types){
			docs{
				_id
				name
				... on ModeledWiki {
			        model{
			            ${MODEL_ATTRIBUTES}
			        }
			        modelColor
			    }
			}
			nextPage
		}
	}
`;

export const useSearchWikiPages = (variables) => {
	return useGQLQuery(SEARCH_WIKIS, variables);
};