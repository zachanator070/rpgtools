import {useParams} from "react-router-dom";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {Game} from "../../types";
import {GET_GAME} from "@rpgtools/common/src/gql-queries";

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
