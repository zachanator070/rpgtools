import {Game} from "../../types.js";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {MY_GAMES} from "@rpgtools/common/src/gql-queries";

interface MyGamesResult extends GqlQueryResult<Game[]>{
	myGames: Game[]
}

export default function useMyGames(): MyGamesResult {
	const result = useGQLQuery<Game[]>(MY_GAMES);
	return {
		...result,
		myGames: result.data
	};
};
