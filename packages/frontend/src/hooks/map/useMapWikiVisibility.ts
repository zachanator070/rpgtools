import gql from "graphql-tag";
import { useQuery } from "@apollo/client";

const MAP_WIKI_VISIBILITY = gql`
	query {
		mapWikiVisibility @client
	}
`;

export default () => {
	const { data, loading, error } = useQuery(MAP_WIKI_VISIBILITY);
	return {
		mapWikiVisibility: data ? data.mapWikiVisibility : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
