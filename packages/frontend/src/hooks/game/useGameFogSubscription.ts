import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription";
import gql from "graphql-tag";
import {FogStroke} from "../../types";
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

interface GameFogSubscriptionResult extends GqlSubscriptionResult<FogStroke>{
	gameFogStrokeAdded: FogStroke
}

export default function useGameFogSubscription(onData?: (data: FogStroke) => any): GameFogSubscriptionResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<FogStroke, GameFogSubscriptionVariables>(
		GAME_FOG_SUBSCRIPTION,
		{ gameId: game_id },
		{onData}
	);
	return {
		...result,
		gameFogStrokeAdded: result.data
	}
};
