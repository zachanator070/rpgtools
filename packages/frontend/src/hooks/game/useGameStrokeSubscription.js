import { useParams } from "react-router-dom";
import { useGQLSubscription } from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_STROKE } from "../../../../common/src/gql-fragments";

export const GAME_STROKE_SUBSCRIPTION = gql`
	${GAME_STROKE}
	subscription gameStrokeAdded($gameId: ID!){
		gameStrokeAdded(gameId: $gameId){
			...gameStroke		
		}
	}
`;
export const useGameStrokeSubscription = () => {
	const { game_id } = useParams();
	return useGQLSubscription(GAME_STROKE_SUBSCRIPTION, { gameId: game_id });
};
