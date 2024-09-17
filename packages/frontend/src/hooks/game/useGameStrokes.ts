import {StrokesPaginated} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_STROKES} from "@rpgtools/common/src/gql-queries.js";
import {useParams} from "react-router-dom";
import useFetchAllPagesEffect from "../useFetchAllPagesEffect.js";

interface GameStrokesVariables {
    gameId: number;
}

interface GameStrokesResult extends GqlQueryResult<StrokesPaginated, GameStrokesVariables>{
    strokes: StrokesPaginated;
}

export default function useGameStrokes(): GameStrokesResult {
    const {game_id} = useParams();
    const result = useGQLQuery<StrokesPaginated, GameStrokesVariables>(GET_STROKES, {gameId: game_id});
    useFetchAllPagesEffect(result, GET_STROKES, {gameId: game_id});
    return {
        ...result,
        strokes: result.data
    };
}