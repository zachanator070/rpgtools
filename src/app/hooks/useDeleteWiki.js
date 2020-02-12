import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import useCurrentWorld from "./useCurrentWorld";

const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!){
		deleteWiki(wikiId: $wikiId) {
			_id
		}
	}
`;

export const useDeleteWiki = () => {
	const [deleteWiki, {data, loading, error}] = useMutation(DELETE_WIKI);
	const {refetch} = useCurrentWorld();
	return {
		deleteWiki: async (wikiId) => {
			const deletedWiki = await deleteWiki({variables: {wikiId}});
			await refetch();
			return deletedWiki;
		},
		wikiPage: data ? data.deleteWiki : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};