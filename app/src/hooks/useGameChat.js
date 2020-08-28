import {useMutation} from "@apollo/react-hooks";
import {GAME_CHAT} from "../../../common/src/gql-queries";

export const useGameChat = () => {
	const [gameChat, {data, loading, error}] = useMutation(GAME_CHAT);
	return {
		gameChat: async (gameId, message) => {
			return gameChat({variables: {gameId, message}});
		},
		game: data ? data.gameChat : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};