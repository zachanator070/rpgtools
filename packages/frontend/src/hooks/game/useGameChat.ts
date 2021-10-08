import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Game} from "../../types";

export const GAME_CHAT = gql`
	mutation gameChatMutation($gameId: ID!, $message: String!) {
		gameChat(gameId: $gameId, message: $message) {
			_id
		}
	}
`;

interface GameChatVariables {
	gameId: string;
	message: string;
}

interface GameChatResult extends GqlMutationResult<Game, GameChatVariables> {
	gameChat: MutationMethod<Game, GameChatVariables>
}

export const useGameChat = (): GameChatResult => {
	const result = useGQLMutation<Game, GameChatVariables>(GAME_CHAT);
	return {
		...result,
		gameChat: result.mutate
	}
};
