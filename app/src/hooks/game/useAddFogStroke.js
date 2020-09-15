import {useGQLMutation} from "../useGQLMutation";
import {ADD_FOG_STROKE} from "../../../../common/src/gql-queries";
import useCurrentGame from "./useCurrentGame";

export const useAddFogStroke = () => {
	const {currentGame} = useCurrentGame();
	const returnValues = useGQLMutation(ADD_FOG_STROKE);
	const addFogStroke = returnValues.addFogStroke;
	returnValues.addFogStroke = async (variables) => {
		await addFogStroke({gameId: currentGame._id, ...variables});
	}
	return returnValues
}