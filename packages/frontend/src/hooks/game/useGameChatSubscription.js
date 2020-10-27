import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MESSAGE } from "@rpgtools/common/src/gql-fragments";

export const GAME_CHAT_SUBSCRIPTION = gql`
	subscription gameChat($gameId: ID!){
		gameChat(gameId: $gameId){
			${GAME_MESSAGE}
		}
	}
`;
export const useGameChatSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_CHAT_SUBSCRIPTION, { gameId: game_id });
};
