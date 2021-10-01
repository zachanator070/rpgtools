import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "../../../../common/src/gql-fragments";
import { useGQLMutation } from "../useGQLMutation";

export const JOIN_GAME = gql`
	${GAME_ATTRIBUTES}
	mutation joinGame($gameId: ID!, $password: String, $characterName: String){
		joinGame(gameId: $gameId, password: $password, characterName: $characterName){
			...gameAttributes
		}
	}
`;
export default (callback) => {
	return useGQLMutation(JOIN_GAME, {}, { onCompleted: callback });
};
