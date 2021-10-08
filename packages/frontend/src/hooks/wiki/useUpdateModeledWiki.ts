import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";

const UPDATE_MODELED_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	mutation updateModeledWiki($wikiId: ID!, $model: ID, $color: String){
		updateModeledWiki(wikiId: $wikiId, model: $model, color: $color){
			...currentWikiAttributes			
		}
	}   
`;

export const useUpdateModeledWiki = () => {
	return useGQLMutation(UPDATE_MODELED_WIKI);
};
