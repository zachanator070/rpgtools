import useCurrentGame from "./useCurrentGame";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {CharacterInput, Game} from "../../types";
import {SET_CHARACTER_ORDER} from "@rpgtools/common/src/gql-mutations";

interface SetCharacterOrderVariables {
	gameId?: string;
	characters: CharacterInput[]
}

interface SetCharacterOrderResult extends GqlMutationResult<Game, SetCharacterOrderVariables> {
	setCharacterOrder: MutationMethod<Game, SetCharacterOrderVariables>
}

export default function useSetCharacterOrder (): SetCharacterOrderResult {
	const { currentGame } = useCurrentGame();
	const result = useGQLMutation<Game, SetCharacterOrderVariables>(SET_CHARACTER_ORDER, {
		gameId: currentGame && currentGame._id,
	});
	return {
		...result,
		setCharacterOrder: result.mutate
	};
};
