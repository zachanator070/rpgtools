import { useParams } from "react-router-dom";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { Game } from "../../types";
import { GET_GAME } from "@rpgtools/common/src/gql-queries";

interface GetGameVariables {
	gameId: string;
}

interface GetGameData {
	currentGame: Game;
}
interface GetGameResult extends GetGameData, GqlQueryResult<Game, GetGameData, GetGameVariables> {}

export default function useCurrentGame(): GetGameResult {
	const { game_id } = useParams();
	const result = useGQLQuery<Game, GetGameData, GetGameVariables>(GET_GAME, { gameId: game_id });
	return {
		...result,
		currentGame: result.data,
	};
}
