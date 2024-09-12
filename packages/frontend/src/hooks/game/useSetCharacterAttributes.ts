import useCurrentGame from "./useCurrentGame.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {Game} from "../../types.js";
import {SET_CHARACTER_ATTRIBUTES} from "@rpgtools/common/src/gql-mutations";
import {useParams} from "react-router-dom";

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
	const {game_id} = useParams();
	const result = useGQLMutation<Game, SetCharacterAttributesVariables>(SET_CHARACTER_ATTRIBUTES, { gameId: game_id });
	return {
		...result,
		setCharacterAttributes: result.mutate
	};
};
