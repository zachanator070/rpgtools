import { useMutation } from "@apollo/client";
import gql from "graphql-tag";

export const GAME_CHAT = gql`
	mutation gameChat($gameId: ID!, $message: String!) {
		gameChat(gameId: $gameId, message: $message) {
			_id
		}
	}
`;
export const useGameChat = () => {
	const [gameChat, { data, loading, error }] = useMutation(GAME_CHAT);
	return {
		gameChat: async (gameId, message) => {
			return gameChat({ variables: { gameId, message } });
		},
		game: data ? data.gameChat : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
	};
};
