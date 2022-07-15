import {Game} from "../../types";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
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
