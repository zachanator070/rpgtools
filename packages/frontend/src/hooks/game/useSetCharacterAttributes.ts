import useCurrentGame from "./useCurrentGame";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {SET_CHARACTER_ATTRIBUTES} from "@rpgtools/common/src/gql-mutations";

interface SetCharacterAttributesVariables {
	gameId: string;
	str?: number;
	dev?: number;
	con?: number;
	int?: number;
	wis?: number;
	cha?: number;
}

interface SetCharacterAttributesResult extends GqlMutationResult<Game, SetCharacterAttributesVariables>{
	setCharacterAttributes: MutationMethod<Game, SetCharacterAttributesVariables>
}
export default function useSetCharacterAttributes(): SetCharacterAttributesResult {
	const { currentGame } = useCurrentGame();
	const result = useGQLMutation<Game, SetCharacterAttributesVariables>(SET_CHARACTER_ATTRIBUTES, { gameId: currentGame._id });
	return {
		...result,
		setCharacterAttributes: result.mutate
	};
};
