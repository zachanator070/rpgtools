import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {Game} from "../../types";
import {GAME_FOG_STROKES, GAME_MAP, GAME_STROKES} from "@rpgtools/common/src/gql-fragments";

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

export default function useGameMapChangeSubscription(): GameMapChangeSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameMapChangeSubscriptionVariables>(GAME_MAP_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameMapChange: result.data
	}
};
