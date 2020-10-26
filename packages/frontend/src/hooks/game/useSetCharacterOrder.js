import gql from "graphql-tag";
import { GAME_CHARACTERS } from "@rpgtools/common/src/gql-fragments";
import useCurrentGame from "./useCurrentGame";
import { useGQLMutation } from "../useGQLMutation";

const SET_CHARACTER_ORDER = gql`
    mutation setCharacterOrder($gameId: ID!, $characters: [CharacterInput!]!){
        setCharacterOrder(gameId: $gameId, characters: $characters){
            _id
            ${GAME_CHARACTERS}
        }
    }
`;

export const useSetCharacterOrder = () => {
  const { currentGame } = useCurrentGame();
  return useGQLMutation(SET_CHARACTER_ORDER, {
    gameId: currentGame && currentGame._id,
  });
};
