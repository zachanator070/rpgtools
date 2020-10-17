import {useMutation} from "@apollo/client";
import useCurrentWiki from "./useCurrentWiki";
import gql from "graphql-tag";
import {CURRENT_WIKI_ATTRIBUTES} from "../../../../common/src/gql-fragments";

export const UPDATE_WIKI = gql`
	mutation updateWiki($wikiId: ID!, $name: String, $content: Upload, $coverImageId: ID, $type: String){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId, type: $type){
			${CURRENT_WIKI_ATTRIBUTES}
		}
	}
`;
export default () => {
	const [updateWiki, {data, loading, error}] = useMutation(UPDATE_WIKI);
	const {refetch} = useCurrentWiki();
	return {
		updateWiki: async (wikiId, name, content, coverImageId, type) => {
			await updateWiki({variables: {wikiId, name, content, coverImageId, type}});
			// I shouldn't have to do this?? When I change only the page type, the cache doesn't update
			await refetch();
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.updateWiki : null
	}
};