import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import {GAME_FOG} from "@rpgtools/common/src/gql-fragments";

export const GAME_FOG_SUBSCRIPTION = gql`
	subscription gameFogStrokeAdded($gameId: ID!){
		gameFogStrokeAdded(gameId: $gameId){
			${GAME_FOG}
		}
	}
`;
export const useGameFogSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_FOG_SUBSCRIPTION, {gameId: game_id});
};