import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import { Game, PathNodeInput } from "../../types";
import { ADD_FOG_STROKE } from "@rpgtools/common/src/gql-mutations";

export interface AddFogVariables {
	gameId?: string;
	path: PathNodeInput[];
	type: string;
	size: number;
	strokeId: string;
}

interface AddFogData {
	addFogStroke: Game;
}
interface AddStrokeResult extends GqlMutationResult<Game, AddFogVariables> {
	addFogStroke: MutationMethod<Game, AddFogVariables>;
}

export default function useAddFogStroke(): AddStrokeResult {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, AddFogData, AddFogVariables>(ADD_FOG_STROKE, {
		gameId: currentGame._id,
	});
	return {
		...returnValues,
		addFogStroke: returnValues.mutate,
	};
}
