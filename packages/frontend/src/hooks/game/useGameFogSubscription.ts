import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game} from "../../types";
import {GAME_FOG} from "@rpgtools/common/src/gql-fragments";

export const GAME_FOG_SUBSCRIPTION = gql`
	${GAME_FOG}
	subscription gameFogStrokeAdded($gameId: ID!){
		gameFogStrokeAdded(gameId: $gameId){
			...gameFog		
		}
	}
`;

interface GameFogSubscriptionVariables {
	gameId: string;
}

interface GameFogSubscriptionResult extends GqlSubscriptionResult<Game>{
	gameFogStrokeAdded: Game
}

export const useGameFogSubscription = (): GameFogSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameFogSubscriptionVariables>(GAME_FOG_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameFogStrokeAdded: result.data
	}
};
