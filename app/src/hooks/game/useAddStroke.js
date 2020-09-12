import {ADD_STROKE} from "../../../../common/src/gql-queries";
import useCurrentGame from "./useCurrentGame";
import {useGQLMutation} from "../useGQLMutation";

export default () => {
	const {currentGame} = useCurrentGame();
	const returnValues = useGQLMutation(ADD_STROKE);
	const addStroke = returnValues.addStroke;
	returnValues.addStroke = async (variables) => {
		await addStroke({gameId: currentGame._id, ...variables});
	}
	return returnValues;
}