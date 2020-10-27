import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "@rpgtools/common/src/gql-fragments";
import { useGQLMutation } from "../useGQLMutation";

export const JOIN_GAME = gql`
    mutation joinGame($gameId: ID!, $password: String, $characterName: String){
        joinGame(gameId: $gameId, password: $password, characterName: $characterName){
            ${GAME_ATTRIBUTES}
        }
    }
`;
export default (callback) => {
	return useGQLMutation(JOIN_GAME, {}, { onCompleted: callback });
};
