import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game} from "../../types";

export const GAME_MODEL_DELETED_SUBSCRIPTION = gql`
	subscription gameModelDeleted($gameId: ID!) {
		gameModelDeleted(gameId: $gameId) {
			_id
		}
	}
`;

interface GameModelDeletedSubscriptionVariables {
	gameId: string;
}

interface GameModelSubscriptionResult extends GqlSubscriptionResult<Game> {
	gameModelDeleted: Game
}

export const useGameModelDeletedSubscription = (): GameModelSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameModelDeletedSubscriptionVariables>(GAME_MODEL_DELETED_SUBSCRIPTION, {
		gameId: game_id,
	});
	return {
		...result,
		gameModelDeleted: result.data
	}
};
