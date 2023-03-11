import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {SET_GAME_MAP} from "@rpgtools/common/src/gql-mutations";
import {GET_FOG_STROKES, GET_STROKES} from "@rpgtools/common/src/gql-queries";

interface SetGameMapVariables {
	gameId: string;
	placeId: string;
	clearPaint?: boolean;
	setFog?: boolean;
}

interface SetGameMapResult extends GqlMutationResult<Game, SetGameMapVariables> {
	setGameMap: MutationMethod<Game, SetGameMapVariables>;
}
export default function useSetGameMap(): SetGameMapResult {
	const result = useGQLMutation<Game, SetGameMapVariables>(SET_GAME_MAP, {}, {refetchQueries: [GET_STROKES, GET_FOG_STROKES]});
	return {
		...result,
		setGameMap: result.mutate
	};
};
