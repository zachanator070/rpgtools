import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {Game} from "../../types";
import {SET_MODEL_COLOR} from "@rpgtools/common/src/gql-mutations";
import {useParams} from "react-router-dom";

interface SetModelColorVariables {
	gameId?: string;
	positionedModelId: string;
	color: string;
}

interface SetModelColorResult extends GqlMutationResult<Game, SetModelColorVariables> {
	setModelColor: MutationMethod<Game, SetModelColorVariables>;
}

export default function useSetModelColor(): SetModelColorResult{
	const {game_id} = useParams();
	const returnValues = useGQLMutation<Game, SetModelColorVariables>(SET_MODEL_COLOR, {gameId: game_id});
	return {
		...returnValues,
		setModelColor: returnValues.mutate
	};
};
