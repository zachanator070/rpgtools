import {useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {SET_MODEL_COLOR} from "../../../../common/src/gql-queries";


export const useSetModelColor = () => {
    const {currentGame} = useCurrentGame();
    const returnValues = useGQLMutation(SET_MODEL_COLOR);
    const setModelColor = returnValues.setModelColor;
    returnValues.setModelColor = async (variables) => {
        await setModelColor({gameId: currentGame._id, positionedModelId: variables._id, ...variables});
    }
    return returnValues;
};