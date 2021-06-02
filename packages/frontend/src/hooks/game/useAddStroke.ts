import useCurrentGame from "./useCurrentGame";
import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";

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
export default () => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation(ADD_STROKE);
	const addStroke = returnValues.addStroke;
	returnValues.addStroke = async (variables) => {
		await addStroke({ gameId: currentGame._id, ...variables });
	};
	return returnValues;
};
