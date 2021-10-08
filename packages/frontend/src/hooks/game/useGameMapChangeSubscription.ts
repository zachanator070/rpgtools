import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_FOG_STROKES, GAME_MAP, GAME_STROKES } from "../gql-fragments";
import {Game} from "../../types";

export const GAME_MAP_SUBSCRIPTION = gql`
	${GAME_MAP}
	${GAME_STROKES}
	${GAME_FOG_STROKES}
	subscription gameMapChange($gameId: ID!,){
		gameMapChange(gameId: $gameId){
			_id
			...gameMap
			...gameStrokes
			...gameFogStrokes		
		}
	}
`;

interface GameMapChangeSubscriptionVariables {
	gameId: string;
}

interface GameMapChangeSubscriptionResult extends GqlSubscriptionResult<Game>{
	gameMapChange: Game;
}

export const useGameMapChangeSubscription = (): GameMapChangeSubscriptionResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameMapChangeSubscriptionVariables>(GAME_MAP_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameMapChange: result.data
	}
};
