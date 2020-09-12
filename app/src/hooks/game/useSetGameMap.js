import {useMutation} from "@apollo/client";
import {SET_GAME_MAP} from "../../../../common/src/gql-queries";

export const useSetGameMap = () => {
	const [setGameMap, {loading, data, error}] = useMutation(SET_GAME_MAP);
	return {
		setGameMap: async (gameId, placeId) => {
			return setGameMap({variables: {gameId, placeId}});
		},
		loading,
		pin: data ? data.updatePin : [],
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};