import { useSubscription} from "@apollo/client";
import {GAME_STROKE_SUBSCRIPTION} from "../../../common/src/gql-queries";
import {useParams} from "react-router-dom";

export const useGameStrokeSubscription = () => {
	const {game_id} = useParams();
	const {data, loading, error} = useSubscription(GAME_STROKE_SUBSCRIPTION, {variables: {gameId: game_id}});
	return {
		gameStrokeAdded: data ? data.gameStrokeAdded : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};