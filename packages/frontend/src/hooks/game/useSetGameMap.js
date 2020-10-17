import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {GAME_FOG_STROKES, GAME_MAP, GAME_STROKES} from "../../../../common/src/gql-fragments";

export const SET_GAME_MAP = gql`
	mutation setGameMap($gameId: ID!, $placeId: ID!, $clearPaint: Boolean, $setFog: Boolean){
		setGameMap(gameId: $gameId, placeId: $placeId, clearPaint: $clearPaint, setFog: $setFog){
			_id
			${GAME_MAP}
			${GAME_STROKES}
			${GAME_FOG_STROKES}
		}
	}
`;
export const useSetGameMap = () => {
	return useGQLMutation(SET_GAME_MAP);
};