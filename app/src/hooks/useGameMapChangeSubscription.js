import { useSubscription} from "@apollo/react-hooks";
import {GAME_MAP_SUBSCRIPTION} from "../../../common/src/gql-queries";
import {useParams} from "react-router-dom";

export const useGameMapChangeSubscription = () => {
	const {game_id} = useParams();
	const {data, loading, error} = useSubscription(GAME_MAP_SUBSCRIPTION, {variables: {gameId: game_id}});
	return {
		game: data ? data.gameRosterChange : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};