import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {GAME_CHAT} from "@rpgtools/common/src/gql-mutations";

interface GameChatVariables {
	gameId: string;
	message: string;
}

interface GameChatResult extends GqlMutationResult<Game, GameChatVariables> {
	gameChat: MutationMethod<Game, GameChatVariables>
}

export default function useGameChat(): GameChatResult {
	const result = useGQLMutation<Game, GameChatVariables>(GAME_CHAT);
	return {
		...result,
		gameChat: result.mutate
	}
};
