import gql from "graphql-tag";
import useCurrentGame from "./useCurrentGame";
import {GqlMutationResult, useGQLMutation} from "../useGQLMutation";
import { GAME_CHARACTERS } from "../gql-fragments";
import {Game} from "../../types";
import {GqlQueryResult} from "../useGQLQuery";

const SET_CHARACTER_ATTRIBUTES = gql`
	${GAME_CHARACTERS}
	mutation setCharacterAttributes($gameId: ID!, $str: Int, $dex: Int, $con: Int, $int: Int, $wis: Int, $cha: Int){
		setCharacterAttributes(gameId: $gameId, str: $str, dex: $dex, con: $con, int: $int, wis: $wis, cha: $cha){
			_id
			...gameCharacters		
		}
	}
`;

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
	setCharacterAttributes: Game
}
export const useSetCharacterAttributes = (): SetCharacterAttributesResult => {
	const { currentGame } = useCurrentGame();
	const result = useGQLMutation<Game, SetCharacterAttributesVariables>(SET_CHARACTER_ATTRIBUTES, { gameId: currentGame._id });
	return {
		...result,
		setCharacterAttributes: result.data
	};
};
