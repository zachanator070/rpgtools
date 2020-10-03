import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {GAME_ATTRIBUTES} from "../../../../common/src/gql-fragments";

export const JOIN_GAME = gql`
    mutation joinGame($gameId: ID!, $password: String){
        joinGame(gameId: $gameId, password: $password){
            ${GAME_ATTRIBUTES}
        }
    }
`;
export default (callback) => {
	const [joinGame, {data, loading, error}] = useMutation(JOIN_GAME, {
		onCompleted: callback
	});
	return {
		joinGame: async (gameId, password) => {
			const response = await joinGame({variables: {gameId: gameId, password: password}});
			return response.data.joinGame;
		},
		game: data ? data.joinGame : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		loading
	};
}