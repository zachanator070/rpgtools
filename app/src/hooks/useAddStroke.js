import {useMutation} from "@apollo/react-hooks";
import {ADD_STROKE, ADD_USER_ROLE} from "../../../common/src/gql-queries";
import useCurrentGame from "./useCurrentGame";

export default () => {
	const [addStroke, {loading, error, data}] = useMutation(ADD_STROKE);
	const {currentGame} = useCurrentGame();
	return {
		addStroke: async (path, type, size, color, fill, strokeId) => {
			await addStroke({variables: {gameId: currentGame._id, path, type, size, color, fill, strokeId}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		game: data ? data.addStroke : null
	}
}