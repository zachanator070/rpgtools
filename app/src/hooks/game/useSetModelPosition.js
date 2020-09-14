import {useGQLMutation} from "../useGQLMutation";
import {SET_MODEL_POSITION} from "../../../../common/src/gql-queries";
import useCurrentGame from "./useCurrentGame";


export const useSetModelPosition = () => {
	const {currentGame} = useCurrentGame();
	const returnValues = useGQLMutation(SET_MODEL_POSITION);
	const setModelPosition = returnValues.setModelPosition;
	returnValues.setModelPosition = async (variables) => {
		await setModelPosition({gameId: currentGame._id, positionedModelId: variables._id, ...variables});
	}
	return returnValues;
};