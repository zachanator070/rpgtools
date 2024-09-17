import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game, PositionedModel} from "../../types";
import {GAME_MODEL} from "@rpgtools/common/src/gql-fragments";

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

interface GameModelPositionedSubscriptionResult extends GqlSubscriptionResult<PositionedModel>{
	gameModelPositioned: PositionedModel
}
export default function useGameModelPositionedSubscription(onData?: (model: PositionedModel) => any): GameModelPositionedSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<PositionedModel, GameModelPositionedSubscriptionVariables>(
		GAME_MODEL_POSITIONED_SUBSCRIPTION,
		{
			gameId: game_id,
		},
		{onData}
	);
	return {
		...result,
		gameModelPositioned: result.data
	}
};
