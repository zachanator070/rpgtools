import {useParams} from "react-router-dom";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {Game} from "../../types.js";
import {GET_GAME} from "@rpgtools/common/src/gql-queries";

interface GetGameVariables {
	gameId: string;
}

interface GetGameResult extends GqlQueryResult<Game, GetGameVariables>{
	currentGame: Game;
}

export default function useCurrentGame(): GetGameResult {
	const { game_id } = useParams();
	const result = useGQLQuery<Game, GetGameVariables>(GET_GAME, {gameId: game_id});
	return {
		...result,
		currentGame: result.data
	};
};
