import gql from "graphql-tag";
import {useLazyQuery} from "@apollo/react-hooks";

const SEARCH_WIKI_PAGES = gql`
	query searchWikiPages($name: String!, $worldId: ID!, $type: String){
		wikis(name: $name, worldId: $worldId, type: $type){
			docs{
				_id
				name
			}
		}
	}
`;

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