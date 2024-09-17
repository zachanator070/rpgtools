import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game, PathNodeInput} from "../../types.js";
import {ADD_FOG_STROKE} from "@rpgtools/common/src/gql-mutations.js";
import {useParams} from "react-router-dom";

export interface AddFogVariables {
	gameId?: string;
	path: PathNodeInput[];
	type: string;
	size: number;
	strokeId: string;
}

interface AddStrokeResult extends GqlMutationResult<Game, AddFogVariables> {
	addFogStroke: MutationMethod<Game, AddFogVariables>;
}

export default function useAddFogStroke(): AddStrokeResult {
	const {game_id} = useParams();
	const returnValues = useGQLMutation<Game, AddFogVariables>(ADD_FOG_STROKE, {gameId: game_id});
	return {
		...returnValues,
		addFogStroke: returnValues.mutate
	};
};
