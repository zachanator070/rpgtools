import { Stroke, StrokesPaginated } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { GET_STROKES } from "@rpgtools/common/src/gql-queries";
import { useParams } from "react-router-dom";
import useFetchAllPagesEffect, { PaginatedQueryVariables } from "../useFetchAllPagesEffect";

interface GameStrokesVariables extends PaginatedQueryVariables {
	gameId: string;
}

interface GameStrokesData {
	strokes: StrokesPaginated;
}
interface GameStrokesResult
	extends GameStrokesData,
		GqlQueryResult<StrokesPaginated, GameStrokesData, GameStrokesVariables> {}

export default function useGameStrokes(): GameStrokesResult {
	const { game_id } = useParams();
	const result = useGQLQuery<StrokesPaginated, GameStrokesData, GameStrokesVariables>(GET_STROKES, {
		gameId: game_id,
	});
	useFetchAllPagesEffect<
		Stroke,
		StrokesPaginated,
		GameStrokesData,
		GameStrokesResult,
		GameStrokesVariables
	>({ ...result, strokes: result.data }, GET_STROKES, { gameId: game_id });
	return {
		...result,
		strokes: result.data,
	};
}
