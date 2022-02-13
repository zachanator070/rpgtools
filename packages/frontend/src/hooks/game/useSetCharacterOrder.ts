import gql from "graphql-tag";
import { GAME_CHARACTERS } from "../gql-fragments";
import useCurrentGame from "./useCurrentGame";
import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {CharacterInput, Game} from "../../types";

const SET_CHARACTER_ORDER = gql`
	${GAME_CHARACTERS}
	mutation setCharacterOrder($gameId: ID!, $characters: [CharacterInput!]!){
		setCharacterOrder(gameId: $gameId, characters: $characters){
			_id
			...gameCharacters
		}
	}
`;

interface SetCharacterOrderVariables {
	gameId?: string;
	characters: CharacterInput[]
}

interface SetCharacterOrderResult extends GqlMutationResult<Game, SetCharacterOrderVariables> {
	setCharacterOrder: MutationMethod<Game, SetCharacterOrderVariables>
}

export const useSetCharacterOrder = (): SetCharacterOrderResult => {
	const { currentGame } = useCurrentGame();
	const result = useGQLMutation<Game, SetCharacterOrderVariables>(SET_CHARACTER_ORDER, {
		gameId: currentGame && currentGame._id,
	});
	return {
		...result,
		setCharacterOrder: result.mutate
	};
};
