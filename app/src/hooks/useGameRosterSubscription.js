import { useSubscription} from "@apollo/react-hooks";
import {GAME_ROSTER_SUBSCRIPTION} from "../../../common/src/gql-queries";
import {useParams} from "react-router-dom";

export const useGameRosterSubscription = () => {
	const {game_id} = useParams();
	const {data, loading, error} = useSubscription(GAME_ROSTER_SUBSCRIPTION, {variables: {gameId: game_id}});
	return {
		game: data ? data.gameRosterChange : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};