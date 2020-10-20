import {CURRENT_WIKI_ATTRIBUTES} from "@rpgtools/common/src/gql-fragments";
import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";


const UPDATE_MODELED_WIKI = gql`
    mutation updateModeledWiki($wikiId: ID!, $model: ID, $color: String){
        updateModeledWiki(wikiId: $wikiId, model: $model, color: $color){
            ${CURRENT_WIKI_ATTRIBUTES}
        }
    }   
`;

export const useUpdateModeledWiki = () => {
    return useGQLMutation(UPDATE_MODELED_WIKI);
}