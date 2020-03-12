import gql from "graphql-tag";
import {useLazyQuery} from "@apollo/react-hooks";

const SEARCH_WIKI_PAGES = gql`
	query searchWikiPages($name: String!, $worldId: ID!){
		wikis(name: $name, worldId: $worldId){
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
		searchWikiPages: async (name, worldId) => {
			return search({variables: {name, worldId}});
		},
		loading,
		wikis: data ? data.wikis.docs : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};