import {useQuery} from "@apollo/client";
import {useParams} from 'react-router-dom';
import {GET_SERVER_CONFIG} from "../../../common/src/gql-queries";

export default () => {
	const {map_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_SERVER_CONFIG);
	return {
		serverConfig: data ? data.serverConfig : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}