import { useParams } from "react-router-dom";
import {GqlSubscriptionResult, useGQLSubscription} from "../useGQLSubscription";
import gql from "graphql-tag";
import { GAME_CHARACTERS } from "../gql-fragments";
import {Game} from "../../types";

export const GAME_ROSTER_SUBSCRIPTION = gql`
	${GAME_CHARACTERS}
	subscription gameRosterChange($gameId: ID!,){
		gameRosterChange(gameId: $gameId){
			_id
			...gameCharacters
		}
	}
`;

interface GameRosterChangeVariables {
	gameId: string;
}

interface GameRosterChangeResult extends GqlSubscriptionResult<Game> {
	gameRosterChange: Game;
}

export const useGameRosterSubscription = (): GameRosterChangeResult => {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameRosterChangeVariables>(GAME_ROSTER_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameRosterChange: result.data
	}
};
