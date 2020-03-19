import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';
import {
	CURRENT_WIKI_ATTRIBUTES,
	CURRENT_WIKI_PLACE_ATTRIBUTES,
	USERS_WITH_PERMISSIONS
} from "../../../common/src/gql-queries";

const GET_CURRENT_WIKI = gql`
    query currentWiki($wikiId: ID!){
        wiki(wikiId: $wikiId) {
            ${CURRENT_WIKI_ATTRIBUTES}
            ${USERS_WITH_PERMISSIONS}
            ... on Place {
                ${CURRENT_WIKI_PLACE_ATTRIBUTES}
            }
            
        }
    }
`;

export default () => {
	const {wiki_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_WIKI, {variables: {wikiId: wiki_id}});
	return {
		currentWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}