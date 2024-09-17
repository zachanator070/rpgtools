import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game, PositionedModel} from "../../types";
import {GAME_MODEL} from "@rpgtools/common/src/gql-fragments";

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

interface GameModelAddedResult extends GqlSubscriptionResult<PositionedModel> {
	gameModelAdded: PositionedModel;
}

export default function useGameModelAddedSubscription(onData?: (data: PositionedModel) => any): GameModelAddedResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<PositionedModel, GameModelAddedSubscriptionVariables>(
		GAME_MODEL_ADDED_SUBSCRIPTION,
		{ gameId: game_id },
		{onData}
	);
	return {
		...result,
		gameModelAdded: result.data
	}
};
