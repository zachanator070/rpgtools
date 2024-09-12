import {FogStrokesPaginated} from "../../types.js";
import {useParams} from "react-router-dom";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {GET_FOG_STROKES} from "@rpgtools/common/src/gql-queries";
import useFetchAllPagesEffect from "../useFetchAllPagesEffect.js";

interface GameFogStrokesVariables {
    gameId: number;
}

interface GameFogStrokesResult extends GqlQueryResult<FogStrokesPaginated, GameFogStrokesVariables>{
    fogStrokes: FogStrokesPaginated;
}

export default function useGameFogStrokes(): GameFogStrokesResult {
    const {game_id} = useParams();
    const result = useGQLQuery<FogStrokesPaginated, GameFogStrokesVariables>(GET_FOG_STROKES, {gameId: game_id});
    useFetchAllPagesEffect(result, GET_FOG_STROKES, {gameId: game_id});
    return {
        ...result,
        fogStrokes: result.data
    };
}