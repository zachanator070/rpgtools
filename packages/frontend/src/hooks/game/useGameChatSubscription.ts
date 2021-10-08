import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MESSAGE } from "../gql-fragments";
import {Game} from "../../types";

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

interface GameChatSubscriptionResult extends GqlSubscriptionResult<Game> {
	gameChat: Game;
}

export const useGameChatSubscription = (): GameChatSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameChatSubscriptionVariables>(GAME_CHAT_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameChat: result.data
	}
};
