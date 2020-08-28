import {useMutation} from "@apollo/react-hooks";
import {LEAVE_GAME} from "../../../common/src/gql-queries";

export default (callback) => {
	const [leaveGame, {data, loading, error}] = useMutation(LEAVE_GAME, {
		onCompleted: callback
	});
	return {
		leaveGame: async (gameId) => {
			const response = await leaveGame({variables: {gameId: gameId}});
			return response.data.leaveGame;
		},
		game: data ? data.leaveGame : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		loading
	};
}