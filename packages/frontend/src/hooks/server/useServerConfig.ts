import gql from "graphql-tag";
import {ACCESS_CONTROL_LIST, SERVER_CONFIG_ROLES} from "../gql-fragments";
import {ServerConfig} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const GET_SERVER_CONFIG = gql`
	${ACCESS_CONTROL_LIST}
	${SERVER_CONFIG_ROLES}
	query serverConfig{
		serverConfig{
			_id
			version
			registerCodes
			...accessControlList
			...serverConfigRoles
		}
	}
`;

interface ServerConfigResult extends GqlQueryResult<ServerConfig> {
	serverConfig: ServerConfig
}

export default (): ServerConfigResult => {
	const result = useGQLQuery<ServerConfig>(GET_SERVER_CONFIG);
	return {
		...result,
		serverConfig: result.data
	};
};
