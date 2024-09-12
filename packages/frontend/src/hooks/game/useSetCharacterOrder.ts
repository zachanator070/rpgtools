import useCurrentGame from "./useCurrentGame.js";
import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {CharacterInput, Game} from "../../types.js";
import {SET_CHARACTER_ORDER} from "@rpgtools/common/src/gql-mutations";
import {useParams} from "react-router-dom";

interface SetCharacterOrderVariables {
	gameId?: string;
	characters: CharacterInput[]
}

interface SetCharacterOrderResult extends GqlMutationResult<Game, SetCharacterOrderVariables> {
	setCharacterOrder: MutationMethod<Game, SetCharacterOrderVariables>
}

export default function useSetCharacterOrder (): SetCharacterOrderResult {
	const {game_id} = useParams();
	const result = useGQLMutation<Game, SetCharacterOrderVariables>(SET_CHARACTER_ORDER, {
		gameId: game_id,
	});
	return {
		...result,
		setCharacterOrder: result.mutate
	};
};
