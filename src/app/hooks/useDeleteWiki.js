import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!){
		deleteWiki(wikiId: $wikiId) {
			_id
		}
	}
`;

export const useDeleteWiki = () => {
	const [deleteWiki, {data, loading, error}] = useMutation(DELETE_WIKI);
	return {
		deleteWiki: async (wikiId) => {
			return await deleteWiki({variables: {wikiId}});
		},
		wikiPage: data ?? data.deleteWiki,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};