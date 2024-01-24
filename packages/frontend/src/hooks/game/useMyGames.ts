import { Game } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { MY_GAMES } from "@rpgtools/common/src/gql-queries";

interface MyGamesData {
	myGames: Game[];
}
interface MyGamesResult extends MyGamesData, GqlQueryResult<Game[], MyGamesData, void> {}

export default function useMyGames(): MyGamesResult {
	const result = useGQLQuery<Game[], MyGamesData, void>(MY_GAMES);
	return {
		...result,
		myGames: result.data,
	};
}
