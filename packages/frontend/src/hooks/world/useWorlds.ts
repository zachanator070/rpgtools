import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {WorldPaginatedResult} from "../../types";
import {GET_WORLDS} from "@rpgtools/common/src/gql-queries";

interface WorldsVariables {
	name?: string;
	page?: number;
}

interface WorldsResult extends GqlQueryResult<WorldPaginatedResult, WorldsVariables>{
	worlds: WorldPaginatedResult;
}

export default function useWorlds(variables): WorldsResult {
	const result = useGQLQuery<WorldPaginatedResult, WorldsVariables>(GET_WORLDS, variables);
	return {
		...result,
		worlds: result.data
	};
};
