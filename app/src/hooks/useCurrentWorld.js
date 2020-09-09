import {useQuery} from "@apollo/client";
import {useParams} from 'react-router-dom';
import {GET_CURRENT_WORLD} from "../../../common/src/gql-queries";


export default () => {
	const {world_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_CURRENT_WORLD, {variables: {worldId: world_id}});
	return {
		currentWorld: data ? data.world : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}