import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const SET_CURRENT_WIKI = gql`
    mutation setCurrentWiki($wikiId: Int!){
        setCurrentWiki(wikiId: $wikiId) @client
    }    
`;

export default () => {
	const [setCurrentWiki, {data, loading, error}] = useMutation(SET_CURRENT_WIKI);
	return {
		setCurrentWiki: async (wikiId) => {await setCurrentWiki({variables: {wikiId}})},
		wiki: data ? data.setCurrentWiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}