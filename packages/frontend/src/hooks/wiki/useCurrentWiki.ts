import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WIKI_ATTRIBUTES,
	CURRENT_WIKI_PLACE_ATTRIBUTES,
} from "../gql-fragments";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiPage} from "../../types";

export const GET_CURRENT_WIKI = gql`
	${CURRENT_WIKI_ATTRIBUTES}
	${ACCESS_CONTROL_LIST}
	${CURRENT_WIKI_PLACE_ATTRIBUTES}
	query currentWiki($wikiId: ID!){
		wiki(wikiId: $wikiId) {
			...currentWikiAttributes
			...accessControlList
			... on Place {
					...currentWikiPlaceAttributes
			}
				
		}
	}
`;

interface CurrentWikiVariables {
	wikiId: string;
}

interface CurrentWikiResult extends GqlQueryResult<WikiPage, CurrentWikiVariables>{
	currentWiki: WikiPage;
}

export default (): CurrentWikiResult => {
	const { wiki_id } = useParams();
	const result = useGQLQuery<WikiPage, CurrentWikiVariables>(GET_CURRENT_WIKI, {wikiId: wiki_id});
	return {
		...result,
		currentWiki: result.data
	};
};
