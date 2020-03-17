import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const SET_MAP_WIKI_VISIBILITY = gql`
    mutation setMapWikiVisibility($visibility: Boolean!){
        setMapWikiVisibility(visibility: $visibility) @client
    }
`;

export default () => {
	const [setMapWikiVisibility, {data, loading, error}] = useMutation(SET_MAP_WIKI_VISIBILITY);
	return {
		setMapWikiVisibility: async (visibility) => {await setMapWikiVisibility({variables: {visibility}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		visibility: data ? data.visibility : null
	};
};