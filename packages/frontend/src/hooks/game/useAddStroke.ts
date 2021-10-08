import useCurrentGame from "./useCurrentGame";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {Game, PathNodeInput} from "../../types";

export const ADD_STROKE = gql`
	mutation addStroke(
		$gameId: ID!
		$path: [PathNodeInput!]!
		$type: String!
		$size: Int!
		$color: String!
		$fill: Boolean!
		$strokeId: ID!
	) {
		addStroke(
			gameId: $gameId
			path: $path
			type: $type
			size: $size
			color: $color
			fill: $fill
			strokeId: $strokeId
		) {
			_id
		}
	}
`;

interface AddStrokeVariables {
	gameId: string;
	path: PathNodeInput[];
	type: string;
	size: number;
	color: string;
	fill: number;
	strokeId: string;
}

interface AddStrokeResult extends GqlMutationResult<Game, AddStrokeVariables> {
	addStroke: MutationMethod<Game, AddStrokeVariables>;
}

export default (): AddStrokeResult => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation<Game, AddStrokeVariables>(ADD_STROKE, {gameId: currentGame._id});
	return {
		...returnValues,
		addStroke: returnValues.mutate
	};
};
