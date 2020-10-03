import {useQuery} from "@apollo/client";
import {useParams} from 'react-router-dom';
import gql from "graphql-tag";
import {ACCESS_CONTROL_LIST, CURRENT_WORLD_ROLES} from "../../../../common/src/gql-fragments";

export const GET_SERVER_CONFIG = gql`
    query serverConfig{
        serverConfig{
            _id
            version
            registerCodes
            ${ACCESS_CONTROL_LIST}
            ${CURRENT_WORLD_ROLES}
        }
    }
`;
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