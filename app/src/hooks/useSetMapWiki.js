import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_MAP_WIKI = gql`
    mutation setMapWiki($mapWikiId: ID!){
        setMapWiki(mapWikiId: $mapWikiId) @client
    }
`;

export default () => {
	const [setMapWiki, {data, loading, error}] = useMutation(SET_MAP_WIKI);
	return {
		setMapWiki: async (mapWikiId) => {await setMapWiki({variables: {mapWikiId}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
};