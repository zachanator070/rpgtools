import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MODEL } from "../gql-fragments";
import {Game} from "../../types";

export const GAME_MODEL_POSITIONED_SUBSCRIPTION = gql`
	${GAME_MODEL}
	subscription gameModelPositioned($gameId: ID!){
		gameModelPositioned(gameId: $gameId){
			...gameModel		
		}
	} 
`;

interface GameModelPositionedSubscriptionVariables {
	gameId: string;
}

interface GameModelPositionedSubscriptionResult extends GqlSubscriptionResult<Game>{
	gameModelPositioned: Game
}
export const useGameModelPositionedSubscription = (): GameModelPositionedSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameModelPositionedSubscriptionVariables>(GAME_MODEL_POSITIONED_SUBSCRIPTION, {
		gameId: game_id,
	});
	return {
		...result,
		gameModelPositioned: result.data
	}
};
