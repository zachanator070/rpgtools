import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_STROKE } from "../gql-fragments";
import {Game} from "../../types";

export const GAME_STROKE_SUBSCRIPTION = gql`
	${GAME_STROKE}
	subscription gameStrokeAdded($gameId: ID!){
		gameStrokeAdded(gameId: $gameId){
			...gameStroke		
		}
	}
`;

interface GameStrokeSubscriptionVariables {
	gameId: string;
}

interface GameStrokeSubscriptionResult extends GqlSubscriptionResult<Game>{
	gameStrokeAdded: Game
}
export const useGameStrokeSubscription = (): GameStrokeSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameStrokeSubscriptionVariables>(GAME_STROKE_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameStrokeAdded: result.data
	}
};
