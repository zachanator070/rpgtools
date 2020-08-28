import { useSubscription} from "@apollo/react-hooks";
import {PLAYER_JOINED_SUBSCRIPTION} from "../../../common/src/gql-queries";
import {useParams} from "react-router-dom";

export const usePlayerJoinedSubscription = () => {
	const {game_id} = useParams();
	const {data, loading, error} = useSubscription(PLAYER_JOINED_SUBSCRIPTION, {variables: {gameId: game_id}});
	return {
		game: data ? data.playerJoined : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};