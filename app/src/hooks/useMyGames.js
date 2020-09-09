import {MY_GAMES} from "../../../common/src/gql-queries";
import {useQuery} from "@apollo/client";

export default () => {
	const {data, loading, error, refetch} = useQuery(MY_GAMES);
	return {
		loading,
		myGames: data ? data.myGames : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		refetch
	};
}