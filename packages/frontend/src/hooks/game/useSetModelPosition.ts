import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {SET_MODEL_POSITION} from "@rpgtools/common/src/gql-mutations";
import {useParams} from "react-router-dom";

export interface SetModelPositionVariables {
	gameId?: string;
	positionedModelId: string;
	x: number;
	z: number;
	lookAtX: number;
	lookAtZ: number;
}

interface SetModelPositionResult extends GqlMutationResult<Game, SetModelPositionVariables>{
	setModelPosition: MutationMethod<Game, SetModelPositionVariables>;
}

export default function useSetModelPosition(): SetModelPositionResult {
	const {game_id} = useParams();
	const returnValues = useGQLMutation<Game, SetModelPositionVariables>(SET_MODEL_POSITION, {gameId: game_id});
	return {
		...returnValues,
		setModelPosition: returnValues.mutate
	}
};
