import { useParams } from "react-router-dom";
import useGQLSubscription, {GqlSubscriptionResult} from "../useGQLSubscription.js";
import gql from "graphql-tag";
import {Game} from "../../types.js";
import {GAME_CHARACTERS} from "@rpgtools/common/src/gql-fragments";

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

export default function useGameRosterSubscription(): GameRosterChangeResult {
	const { game_id } = useParams();
	const result = useGQLSubscription<Game, GameRosterChangeVariables>(GAME_ROSTER_SUBSCRIPTION, { gameId: game_id });
	return {
		...result,
		gameRosterChange: result.data
	}
};
