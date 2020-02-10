import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const UPDATE_WIKI = gql`
	mutation updateWiki($wikiId: ID!, $name: String!, $content: Upload, $coverImageId: ID){
		updateWiki(wikiId: $wikiId, name: $name, content: $content, coverImageId: $coverImageId){
			_id
			content
			name
			type
			coverImage {
				_id
			}
		}
	}
`;

export default () => {
	const [updateWiki, {data, loading, error}] = useMutation(UPDATE_WIKI);
	return {
		updateWiki: async (wikiId, name, content, coverImageId) => {
			await updateWiki({variables: {wikiId, name, content, coverImageId}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		wiki: data ? data.updateWiki : null
	}
};