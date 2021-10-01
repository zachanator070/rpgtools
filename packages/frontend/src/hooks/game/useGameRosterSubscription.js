import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_CHARACTERS } from "../../../../common/src/gql-fragments";

export const GAME_ROSTER_SUBSCRIPTION = gql`
	${GAME_CHARACTERS}
	subscription gameRosterChange($gameId: ID!,){
		gameRosterChange(gameId: $gameId){
			_id
			...gameCharacters
		}
	}
`;
export const useGameRosterSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_ROSTER_SUBSCRIPTION, { gameId: game_id });
};
