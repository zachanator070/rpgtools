import {GAME_CHAT_SUBSCRIPTION} from "../../../common/src/gql-queries";
import {useSubscription} from "@apollo/react-hooks";
import {useParams} from 'react-router-dom';

export const useGameChatSubscription = () => {
	const {game_id} = useParams();
	const {data, loading, error} = useSubscription(GAME_CHAT_SUBSCRIPTION, {variables: {gameId: game_id}});
	return {
		gameChat: data ? data.gameChat : null,
		loading: loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};