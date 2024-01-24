import { ServerConfig } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { GET_SERVER_CONFIG } from "@rpgtools/common/src/gql-queries";

interface ServerConfigData {
	serverConfig: ServerConfig;
}
interface ServerConfigResult
	extends ServerConfigData,
		GqlQueryResult<ServerConfig, ServerConfigData, void> {}

export default function useServerConfig(): ServerConfigResult {
	const result = useGQLQuery<ServerConfig, ServerConfigData>(GET_SERVER_CONFIG);
	return {
		...result,
		serverConfig: result.data,
	};
}
