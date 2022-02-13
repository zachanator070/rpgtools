import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MESSAGE } from "../gql-fragments";
import {Game, GameMessage} from "../../types";

export const GAME_CHAT_SUBSCRIPTION = gql`
	${GAME_MESSAGE}
	subscription gameChatSubscription($gameId: ID!){
		gameChat(gameId: $gameId){
			...gameMessage
		}
	}
`;

interface GameChatSubscriptionVariables {
	gameId: string;
}

interface GameChatSubscriptionResult extends GqlSubscriptionResult<GameMessage> {
	gameChat: GameMessage;
}

export const useGameChatSubscription = (): GameChatSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<GameMessage, GameChatSubscriptionVariables>(GAME_CHAT_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameChat: result.data
	}
};
