import gql from "graphql-tag";
import {useQuery} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';
import {CURRENT_WORLD_PERMISSIONS} from "./useCurrentWorld";

const GET_SERVER_CONFIG = gql`
    query serverConfig{
        serverConfig{
            _id
            version
            registerCodes
            adminUsers{
                _id
                username
                ${CURRENT_WORLD_PERMISSIONS}
            }
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