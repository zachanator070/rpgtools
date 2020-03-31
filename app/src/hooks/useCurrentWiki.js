import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';
import {GET_CURRENT_WIKI} from "../../../common/src/gql-queries";

export default () => {
	const {wiki_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_WIKI, {variables: {wikiId: wiki_id}});
	return {
		currentWiki: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}