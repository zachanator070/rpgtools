import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";
import { GAME_MODEL } from "../gql-fragments";
import {Game} from "../../types";

export const SET_MODEL_COLOR = gql`
	${GAME_MODEL}
	mutation setModelColor($gameId: ID!, $positionedModelId: ID!, $color: String){
		setModelColor(gameId: $gameId, positionedModelId: $positionedModelId, color: $color){
			...gameModel
		}
	}
`;

interface SetModelColorVariables {
	gameId?: string;
	positionedModelId: string;
	color: string;
}

interface SetModelColorResult extends GqlMutationResult<Game, SetModelColorVariables> {
	setModelColor: MutationMethod<Game, SetModelColorVariables>;
}

export const useSetModelColor = (): SetModelColorResult => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, SetModelColorVariables>(SET_MODEL_COLOR, {gameId: currentGame});
	return {
		...returnValues,
		setModelColor: returnValues.mutate
	};
};
