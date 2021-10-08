import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {Game} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const MY_GAMES = gql`
	query myGames {
		myGames {
			_id
		}
	}
`;
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
