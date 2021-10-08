import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_MODEL } from "../gql-fragments";
import {Game} from "../../types";

export const GAME_MODEL_ADDED_SUBSCRIPTION = gql`
	${GAME_MODEL}
	subscription gameModelAdded($gameId: ID!){
		gameModelAdded(gameId: $gameId){
			...gameModel
		}
	}
`;

interface GameModelAddedSubscriptionVariables {
	gameId: string;
}

interface GameModelAddedResult extends GqlSubscriptionResult<Game> {
	gameModelAdded: Game;
}

export const useGameModelAddedSubscription = (): GameModelAddedResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameModelAddedSubscriptionVariables>(GAME_MODEL_ADDED_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameModelAdded: result.data
	}
};
