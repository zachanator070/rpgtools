import gql from "graphql-tag";
import useCurrentGame from "./useCurrentGame";
import { useGQLMutation } from "../useGQLMutation";
import { GAME_CHARACTERS } from "../../../../common/src/gql-fragments";

const SET_CHARACTER_ATTRIBUTES = gql`
	mutation setCharacterAttributes($gameId: ID!, $str: Int, $dex: Int, $con: Int, $int: Int, $wis: Int, $cha: Int){
		setCharacterAttributes(gameId: $gameId, str: $str, dex: $dex, con: $con, int: $int, wis: $wis, cha: $cha){
			_id
			${GAME_CHARACTERS}
		}
	}	
`;

export const useSetCharacterAttributes = () => {
	const { currentGame } = useCurrentGame();
	return useGQLMutation(SET_CHARACTER_ATTRIBUTES, { gameId: currentGame._id });
};
