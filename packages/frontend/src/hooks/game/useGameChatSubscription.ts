import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game, GameMessage} from "../../types";
import {GAME_MESSAGE} from "@rpgtools/common/src/gql-fragments";

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

export default function useGameChatSubscription(onData?: (message: GameMessage) => any): GameChatSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<GameMessage, GameChatSubscriptionVariables>(GAME_CHAT_SUBSCRIPTION, { gameId: game_id }, {onData});
	return {
		...result,
		gameChat: result.data
	}
};
