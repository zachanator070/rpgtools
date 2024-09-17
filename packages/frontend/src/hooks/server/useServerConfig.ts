import {ServerConfig} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_SERVER_CONFIG} from "@rpgtools/common/src/gql-queries.js";

interface ServerConfigResult extends GqlQueryResult<ServerConfig> {
	serverConfig: ServerConfig
}

export default function useServerConfig(): ServerConfigResult {
	const result = useGQLQuery<ServerConfig>(GET_SERVER_CONFIG);
	return {
		...result,
		serverConfig: result.data
	};
};
