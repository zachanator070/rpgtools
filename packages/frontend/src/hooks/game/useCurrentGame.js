import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "../../../../common/src/gql-fragments";

export const GET_GAME = gql`
	${GAME_ATTRIBUTES}
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			...gameAttributes
		}
	}
`;
export default () => {
	const { game_id } = useParams();
	const { data, loading, error, refetch } = useQuery(GET_GAME, {
		variables: { gameId: game_id },
	});
	return {
		currentGame: data ? data.game : null,
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		refetch,
	};
};
