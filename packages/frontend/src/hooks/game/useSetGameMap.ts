import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import { GAME_FOG_STROKES, GAME_MAP, GAME_STROKES } from "../gql-fragments";
import {Game} from "../../types";

export const SET_GAME_MAP = gql`
	${GAME_MAP}
	${GAME_STROKES}
	${GAME_FOG_STROKES}
	mutation setGameMap($gameId: ID!, $placeId: ID!, $clearPaint: Boolean, $setFog: Boolean){
		setGameMap(gameId: $gameId, placeId: $placeId, clearPaint: $clearPaint, setFog: $setFog){
			_id
			...gameMap
			...gameStrokes
			...gameFogStrokes
		}
	}
`;

interface SetGameMapVariables {
	gameId: string;
	placeId: string;
	clearPaint?: boolean;
	setFog?: boolean;
}

interface SetGameMapResult extends GqlMutationResult<Game, SetGameMapVariables> {
	setGameMap: MutationMethod<Game, SetGameMapVariables>;
}
export const useSetGameMap = (): SetGameMapResult => {
	const result = useGQLMutation<Game, SetGameMapVariables>(SET_GAME_MAP);
	return {
		...result,
		setGameMap: result.mutate
	};
};
