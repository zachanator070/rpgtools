import {useLazyQuery} from "@apollo/react-hooks";
import {SEARCH_WIKI_PAGES} from "../../../common/src/gql-queries";

export const useSearchWikiPages = () => {
	const [search, {loading, data, error}] = useLazyQuery(SEARCH_WIKI_PAGES);
	return {
		searchWikiPages: async (name, worldId, type) => {
			return search({variables: {name, worldId, type}});
		},
		loading,
		wikis: data ? data.wikis.docs : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};