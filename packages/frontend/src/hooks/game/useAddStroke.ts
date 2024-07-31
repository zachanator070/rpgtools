import useCurrentGame from "./useCurrentGame";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game, PathNodeInput} from "../../types";
import {ADD_STROKE} from "@rpgtools/common/src/gql-mutations";

export interface AddStrokeVariables {
	gameId?: string;
	path: PathNodeInput[];
	type: string;
	size: number;
	color: string;
	fill: boolean;
	strokeId: string;
}

interface AddStrokeResult extends GqlMutationResult<Game, AddStrokeVariables> {
	addStroke: MutationMethod<Game, AddStrokeVariables>;
}

export default function useAddStroke(): AddStrokeResult {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, AddStrokeVariables>(ADD_STROKE, {gameId: currentGame._id});
	return {
		...returnValues,
		addStroke: returnValues.mutate
	};
};
