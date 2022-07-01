import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {Game} from "../../types";
import {SET_MODEL_POSITION} from "@rpgtools/common/src/gql-mutations";

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
