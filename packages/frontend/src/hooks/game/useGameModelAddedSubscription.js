import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import {GAME_MODEL} from "@rpgtools/common/src/gql-fragments";

export const GAME_MODEL_ADDED_SUBSCRIPTION = gql`
	subscription gameModelAdded($gameId: ID!){
		gameModelAdded(gameId: $gameId){
			${GAME_MODEL}
		}
	}
`;
export const useGameModelAddedSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MODEL_ADDED_SUBSCRIPTION, {gameId: game_id});
};