import {useMutation} from "@apollo/react-hooks";
import {DELETE_WIKI} from "../../../common/src/gql-queries";

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