import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game} from "../../types";
import {GAME_STROKE} from "@rpgtools/common/src/gql-fragments";

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
export default function useGameStrokeSubscription(): GameStrokeSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameStrokeSubscriptionVariables>(GAME_STROKE_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameStrokeAdded: result.data
	}
};
