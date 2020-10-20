import {useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import gql from "graphql-tag";
import {GAME_MODEL} from "@rpgtools/common/src/gql-fragments";


export const SET_MODEL_COLOR = gql`
	mutation setModelColor($gameId: ID!, $positionedModelId: ID!, $color: String){
		setModelColor(gameId: $gameId, positionedModelId: $positionedModelId, color: $color){
			${GAME_MODEL}
		}
	}
`;
export const useSetModelColor = () => {
    const {currentGame} = useCurrentGame();
    const returnValues = useGQLMutation(SET_MODEL_COLOR);
    const setModelColor = returnValues.setModelColor;
    returnValues.setModelColor = async (variables) => {
        await setModelColor({gameId: currentGame._id, positionedModelId: variables._id, ...variables});
    }
    return returnValues;
};