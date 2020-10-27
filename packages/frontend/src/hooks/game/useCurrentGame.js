import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import { GAME_ATTRIBUTES } from "@rpgtools/common/src/gql-fragments";

export const GET_GAME = gql`
	query getGame($gameId: ID!){
		game(gameId: $gameId){
			${GAME_ATTRIBUTES}
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
