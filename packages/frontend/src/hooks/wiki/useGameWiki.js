import {CURRENT_WIKI_ATTRIBUTES} from "../../../../common/src/gql-fragments";
import gql from "graphql-tag";
import {useGQLLazyQuery} from "../useGQLLazyQuery";

export const GAME_WIKI = gql`
	query wiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
        }
    }
`;

export default () => {

    return useGQLLazyQuery(GAME_WIKI);

}