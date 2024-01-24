import useGQLMutation, { GqlMutationResult, MutationMethod } from "../useGQLMutation";
import { Game } from "../../types";
import { GAME_CHAT } from "@rpgtools/common/src/gql-mutations";

interface GameChatVariables {
	gameId: string;
	message: string;
}

interface GameChatData {
	gameChat: Game;
}

interface GameChatResult extends GqlMutationResult<Game, GameChatVariables> {
	gameChat: MutationMethod<Game, GameChatVariables>;
}

export default function useGameChat(): GameChatResult {
	const result = useGQLMutation<Game, GameChatData, GameChatVariables>(GAME_CHAT);
	return {
		...result,
		gameChat: result.mutate,
	};
}
