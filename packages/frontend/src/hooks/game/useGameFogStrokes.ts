import { FogStroke, FogStrokesPaginated } from "../../types";
import { useParams } from "react-router-dom";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { GET_FOG_STROKES } from "@rpgtools/common/src/gql-queries";
import useFetchAllPagesEffect, { PaginatedQueryVariables } from "../useFetchAllPagesEffect";

interface GameFogStrokesVariables extends PaginatedQueryVariables {
	gameId: string;
	page?: number;
}

interface GameFogStrokeData {
	fogStrokes: FogStrokesPaginated;
}

interface GameFogStrokesResult
	extends GameFogStrokeData,
		GqlQueryResult<FogStrokesPaginated, GameFogStrokeData, GameFogStrokesVariables> {}

export default function useGameFogStrokes(): GameFogStrokesResult {
	const { game_id } = useParams();
	const result = useGQLQuery<FogStrokesPaginated, GameFogStrokeData, GameFogStrokesVariables>(
		GET_FOG_STROKES,
		{ gameId: game_id },
	);
	useFetchAllPagesEffect<
		FogStroke,
		FogStrokesPaginated,
		GameFogStrokeData,
		GameFogStrokesResult,
		GameFogStrokesVariables
	>({ ...result, fogStrokes: result.data }, GET_FOG_STROKES, { gameId: game_id });
	return {
		...result,
		fogStrokes: result.data,
	};
}
