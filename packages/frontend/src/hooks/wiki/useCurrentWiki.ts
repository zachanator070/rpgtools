import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import {
	ACCESS_CONTROL_LIST,
	CURRENT_WIKI_ATTRIBUTES,
	CURRENT_WIKI_PLACE_ATTRIBUTES,
} from "../gql-fragments";

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
export default () => {
	const { wiki_id } = useParams();
	const { data, loading, error, refetch } = useQuery(GET_CURRENT_WIKI, {
		variables: { wikiId: wiki_id },
	});
	return {
		currentWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
