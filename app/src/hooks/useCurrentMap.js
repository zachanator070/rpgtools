import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';
import {GET_CURRENT_MAP} from "../../../common/src/gql-queries";

export default () => {
	const {map_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_MAP, {variables: {wikiId: map_id}});
	return {
		currentMap: data ? data.wiki : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}