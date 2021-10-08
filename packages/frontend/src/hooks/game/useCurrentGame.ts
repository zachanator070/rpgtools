import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "../gql-fragments";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {Game} from "../../types";

export const GET_GAME = gql`
	${GAME_ATTRIBUTES}
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			...gameAttributes
		}
	}
`;

interface GetGameVariables {
	gameId: string;
}

interface GetGameResult extends GqlQueryResult<Game, GetGameVariables>{
	currentGame: Game;
}

export default (): GetGameResult => {
	const { game_id } = useParams();
	const result = useGQLQuery<Game, GetGameVariables>(GET_GAME, {gameId: game_id});
	return {
		...result,
		currentGame: result.data
	};
};
