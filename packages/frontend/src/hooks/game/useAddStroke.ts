import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game, PathNodeInput} from "../../types.js";
import {ADD_STROKE} from "@rpgtools/common/src/gql-mutations.js";
import {useParams} from "react-router-dom";

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
	const {game_id} = useParams();
	const returnValues = useGQLMutation<Game, AddStrokeVariables>(ADD_STROKE, {gameId: game_id});
	return {
		...returnValues,
		addStroke: returnValues.mutate
	};
};
