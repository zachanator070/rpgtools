import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import {GAME_PLAYERS} from "../../../../common/src/gql-fragments";

export const GAME_ROSTER_SUBSCRIPTION = gql`
	subscription gameRosterChange($gameId: ID!,){
		gameRosterChange(gameId: $gameId){
			_id
			${GAME_PLAYERS}
		}
	}
`;
export const useGameRosterSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_ROSTER_SUBSCRIPTION, {gameId: game_id});
};