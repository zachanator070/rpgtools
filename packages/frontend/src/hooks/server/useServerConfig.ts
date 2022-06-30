import {ServerConfig} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {GET_SERVER_CONFIG} from "@rpgtools/common/src/gql-queries";

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