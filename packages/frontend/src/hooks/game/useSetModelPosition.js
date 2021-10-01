import { useGQLMutation } from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";
import { GAME_MODEL } from "../../../../common/src/gql-fragments";

export const SET_MODEL_POSITION = gql`
	${GAME_MODEL}
	mutation setModelPosition($gameId: ID!, $positionedModelId: ID!, $x: Float!, $z: Float!, $lookAtX: Float!, $lookAtZ: Float!){
		setModelPosition(gameId: $gameId, positionedModelId: $positionedModelId, x: $x, z: $z, lookAtX: $lookAtX, lookAtZ: $lookAtZ){
			...gameModel
		}
	}
`;
export const useSetModelPosition = () => {
	const { currentGame } = useCurrentGame();
	const returnValues = useGQLMutation(SET_MODEL_POSITION);
	const setModelPosition = returnValues.setModelPosition;
	returnValues.setModelPosition = async (variables) => {
		await setModelPosition({
			gameId: currentGame._id,
			positionedModelId: variables._id,
			...variables,
		});
	};
	return returnValues;
};
