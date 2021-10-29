import { CURRENT_WIKI_ATTRIBUTES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {ModeledWiki} from "../../types";

const UPDATE_MODELED_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	mutation updateModeledWiki($wikiId: ID!, $model: ID, $color: String){
		updateModeledWiki(wikiId: $wikiId, model: $model, color: $color){
			...currentWikiAttributes			
		}
	}   
`;

interface UpdateModeledWikiVariables {
	wikiId: string;
	model: string;
	color: string;
}

interface UpdateModeledWikiResult {
	updateModeledWiki: MutationMethod<ModeledWiki, UpdateModeledWikiVariables>;
}
export const useUpdateModeledWiki = (): UpdateModeledWikiResult => {
	const result = useGQLMutation<ModeledWiki, UpdateModeledWikiVariables>(UPDATE_MODELED_WIKI);
	return {
		...result,
		updateModeledWiki: result.mutate
	};
};
