import {GAME_CHAT_SUBSCRIPTION} from "../../../../common/src/gql-queries";
import {useParams} from 'react-router-dom';
import {useGQLSubscription} from "../useGQLSubscription";

export const useGameChatSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_CHAT_SUBSCRIPTION, {gameId: game_id});
};