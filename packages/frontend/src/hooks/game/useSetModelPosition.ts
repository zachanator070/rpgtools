import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";
import { GAME_MODEL } from "../gql-fragments";
import {Game} from "../../types";

export const SET_MODEL_POSITION = gql`
	${GAME_MODEL}
	mutation setModelPosition($gameId: ID!, $positionedModelId: ID!, $x: Float!, $z: Float!, $lookAtX: Float!, $lookAtZ: Float!){
		setModelPosition(gameId: $gameId, positionedModelId: $positionedModelId, x: $x, z: $z, lookAtX: $lookAtX, lookAtZ: $lookAtZ){
			...gameModel
		}
	}
`;

export interface SetModelPositionVariables {
	gameId: string;
	positionedModelId: string;
	x: number;
	z: number;
	lookAtX: number;
	lookAtZ: number;
}

interface SetModelPositionResult extends GqlMutationResult<Game, SetModelPositionVariables>{
	setModelPosition: MutationMethod<Game, SetModelPositionVariables>;
}

export const useSetModelPosition = (): SetModelPositionResult => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, SetModelPositionVariables>(SET_MODEL_POSITION, {gameId: currentGame._id});
	return {
		...returnValues,
		setModelPosition: returnValues.mutate
	}
};
