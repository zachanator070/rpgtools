import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game, PositionedModel} from "../../types";

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

interface GameModelSubscriptionResult extends GqlSubscriptionResult<PositionedModel> {
	gameModelDeleted: PositionedModel
}

export default function useGameModelDeletedSubscription(onData: (model: PositionedModel) => void): GameModelSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<PositionedModel, GameModelDeletedSubscriptionVariables>(
		GAME_MODEL_DELETED_SUBSCRIPTION,
		{gameId: game_id},
		{onData}
	);
	return {
		...result,
		gameModelDeleted: result.data
	}
};
