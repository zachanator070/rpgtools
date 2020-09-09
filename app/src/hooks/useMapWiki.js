import {useQuery} from "@apollo/client";
import {MAP_WIKI, MAP_WIKI_ID} from "../../../common/src/gql-queries";

export default () => {

	const {data: {mapWiki}} = useQuery(MAP_WIKI_ID);
	const {data, loading, error} = useQuery(MAP_WIKI, {variables: {wikiId: mapWiki}});

	return {
		mapWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	};
}