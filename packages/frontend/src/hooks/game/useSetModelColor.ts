import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {Game} from "../../types";
import {SET_MODEL_COLOR} from "@rpgtools/common/src/gql-mutations";

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
