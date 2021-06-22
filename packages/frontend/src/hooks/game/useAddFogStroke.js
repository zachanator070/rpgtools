import { useGQLMutation } from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";

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
export const useAddFogStroke = () => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation(ADD_FOG_STROKE);
	const addFogStroke = returnValues.addFogStroke;
	returnValues.addFogStroke = async (variables) => {
		await addFogStroke({ gameId: currentGame._id, ...variables });
	};
	return returnValues;
};
