import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription.js";
import gql from "graphql-tag";
import {GameMapChange} from "../../types.js";
import {GAME_MAP} from "@rpgtools/common/src/gql-fragments";

export const GAME_MAP_SUBSCRIPTION = gql`
	${GAME_MAP}
	subscription gameMapChange($gameId: ID!){
		gameMapChange(gameId: $gameId){
			map {
				...gameMap
			}
			setFog
		}
	}
`;

interface GameMapChangeSubscriptionVariables {
	gameId: string;
}

interface GameMapChangeSubscriptionResult extends GqlSubscriptionResult<GameMapChange>{
	gameMapChange: GameMapChange;
}

export default function useGameMapChangeSubscription(onData?: (data: GameMapChange) => any): GameMapChangeSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<GameMapChange, GameMapChangeSubscriptionVariables>(
		GAME_MAP_SUBSCRIPTION,
		{ gameId: game_id },
		{onData}
	);
	return {
		...result,
		gameMapChange: result.data
	}
};
