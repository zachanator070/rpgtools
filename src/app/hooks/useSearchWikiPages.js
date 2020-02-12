import gql from "graphql-tag";
import {useLazyQuery} from "@apollo/react-hooks";

const SEARCH_WIKI_PAGES = gql`
	query searchWikiPages($phrase: String!, $worldId: ID!){
		searchWikiPages(phrase: $phrase, worldId: $worldId){
			_id
			name
		}
	}
`;

export const useSearchWikiPages = () => {
	const [search, {loading, data, error}] = useLazyQuery(SEARCH_WIKI_PAGES);
	return {
		searchWikiPages: async (phrase, worldId) => {
			return await search({variables: {phrase, worldId}});
		},
		loading,
		wikis: data ? data.searchWikiPages : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};