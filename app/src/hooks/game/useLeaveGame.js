import {useMutation} from "@apollo/client";
import gql from "graphql-tag";

export const LEAVE_GAME = gql`
	mutation leaveGame($gameId: ID!){
		leaveGame(gameId: $gameId)
	}
`;
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