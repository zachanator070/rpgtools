import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {Game, PathNodeInput} from "../../types";
import {ADD_FOG_STROKE} from "@rpgtools/common/src/gql-mutations";

export interface AddStrokeVariables {
	gameId?: string;
	path: PathNodeInput[];
	type: string;
	size: number;
	strokeId: string;
}

interface AddStrokeResult extends GqlMutationResult<Game, AddStrokeVariables> {
	addFogStroke: MutationMethod<Game, AddStrokeVariables>;
}

export default function useAddFogStroke(): AddStrokeResult {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, AddStrokeVariables>(ADD_FOG_STROKE, {gameId: currentGame._id});
	return {
		...returnValues,
		addFogStroke: returnValues.mutate
	};
};
