import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";
import useCurrentWorld, {CURRENT_WORLD_FOLDERS} from "./useCurrentWorld";

const DELETE_WIKI = gql`
	mutation deleteWiki($wikiId: ID!){
		deleteWiki(wikiId: $wikiId) {
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
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