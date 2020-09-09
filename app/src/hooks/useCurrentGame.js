import {useQuery} from "@apollo/client";
import {useParams} from 'react-router-dom';
import {GET_GAME} from "../../../common/src/gql-queries";

export default () => {
	const {game_id} = useParams();
	const {data, loading, error, refetch} = useQuery(GET_GAME, {variables: {gameId: game_id}});
	return {
		currentGame: data ? data.game : null,
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}