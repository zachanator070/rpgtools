import { PinPaginatedResult } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { GET_PINS } from "@rpgtools/common/src/gql-queries";
import { useParams } from "react-router-dom";
import useFetchAllPagesEffect from "../useFetchAllPagesEffect";

interface GetPinsVariables {
	worldId?: string;
	page?: number;
}

interface GetPinsData {
	pins: PinPaginatedResult;
}
interface GetPinsResult extends GqlQueryResult<PinPaginatedResult, GetPinsData, GetPinsVariables> {
	pins: PinPaginatedResult;
}

export default function usePins(variables: GetPinsVariables): GetPinsResult {
	const params = useParams();
	if (!variables.worldId) {
		variables.worldId = params.world_id;
	}
	if (!variables.page) {
		variables.page = 1;
	}
	const result = useGQLQuery<PinPaginatedResult, GetPinsData, GetPinsVariables>(
		GET_PINS,
		variables,
	);
	useFetchAllPagesEffect(result, GET_PINS, variables);
	return {
		...result,
		pins: result.data,
	};
}
