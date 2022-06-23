import {Game} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {MY_GAMES} from "@rpgtools/common/src/gql-queries";

interface MyGamesResult extends GqlQueryResult<Game[]>{
	myGames: Game[]
}

export default (): MyGamesResult => {
	const result = useGQLQuery<Game[]>(MY_GAMES);
	return {
		...result,
		myGames: result.data
	};
};
