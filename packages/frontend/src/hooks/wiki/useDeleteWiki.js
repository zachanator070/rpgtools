import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {CURRENT_WORLD_FOLDERS} from "@rpgtools/common/src/gql-fragments";

export const DELETE_WIKI = gql`
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
			return deleteWiki({variables: {wikiId}});
		},
		wikiPage: data ? data.deleteWiki : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};