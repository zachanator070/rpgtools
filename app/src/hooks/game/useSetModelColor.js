import {useGQLMutation} from "../useGQLMutation";
import useCurrentGame from "./useCurrentGame";
import {SET_MODEL_COLOR} from "../../../../common/src/gql-queries";


export const useSetModelColor = () => {
    const {currentGame} = useCurrentGame();
    const returnValues = useGQLMutation(SET_MODEL_COLOR);
    const setModelPosition = returnValues.setModelPosition;
    returnValues.setModelPosition = async (variables) => {
        await setModelPosition({gameId: currentGame._id, positionedModelId: variables._id, ...variables});
    }
    return returnValues;
};