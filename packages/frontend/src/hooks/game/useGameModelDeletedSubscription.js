import {useParams} from "react-router-dom";
import {useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";

export const GAME_MODEL_DELETED_SUBSCRIPTION = gql`
	subscription gameModelDeleted($gameId: ID!){
		gameModelDeleted(gameId: $gameId){
			_id
		}
	}
`;
export const useGameModelDeletedSubscription = () => {
	const {game_id} = useParams();
	return useGQLSubscription(GAME_MODEL_DELETED_SUBSCRIPTION, {gameId: game_id});
};