import {useMutation} from "@apollo/react-hooks";
import {JOIN_GAME} from "../../../common/src/gql-queries";

export default (callback) => {
	const [joinGame, {data, loading, error}] = useMutation(JOIN_GAME, {
		onCompleted: callback
	});
	return {
		createGame: async (gameId, password) => {
			const response = await joinGame({variables: {gameId: gameId, password: password}});
			return response.data.joinGame;
		},
		game: data ? data.createGame : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		loading
	};
}