import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";
import {Game, PathNodeInput} from "../../types";

export const ADD_FOG_STROKE = gql`
	mutation addFogStroke(
		$gameId: ID!
		$path: [PathNodeInput!]!
		$type: String!
		$size: Int!
		$strokeId: ID!
	) {
		addFogStroke(
			gameId: $gameId
			path: $path
			type: $type
			size: $size
			strokeId: $strokeId
		) {
			_id
		}
	}
`;

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

export const useAddFogStroke = (): AddStrokeResult => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, AddStrokeVariables>(ADD_FOG_STROKE, {gameId: currentGame._id});
	return {
		...returnValues,
		addFogStroke: returnValues.mutate
	};
};
