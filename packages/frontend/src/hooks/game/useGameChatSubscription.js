import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MESSAGE } from "../../../../common/src/gql-fragments";

export const GAME_CHAT_SUBSCRIPTION = gql`
	${GAME_MESSAGE}
	subscription gameChatSubscription($gameId: ID!){
		gameChat(gameId: $gameId){
			...gameMessage
		}
	}
`;
export const useGameChatSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_CHAT_SUBSCRIPTION, { gameId: game_id });
};
