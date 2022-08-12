import useCurrentGame from "./useCurrentGame";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {Game} from "../../types";
import {SET_CHARACTER_ATTRIBUTES} from "@rpgtools/common/src/gql-mutations";

export interface CharacterAttributeInput {
	_id?: string;
	name: string;
	value: number;
}

interface SetCharacterAttributesVariables {
	gameId?: string;
	attributes: CharacterAttributeInput[];
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
