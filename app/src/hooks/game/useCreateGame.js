import {useMutation} from "@apollo/client";
import {CREATE_GAME} from "../../../../common/src/gql-queries";
import useCurrentWorld from "../world/useCurrentWorld";

export default (callback) => {

	const {currentWorld} = useCurrentWorld();
	const [createGame, {data, loading, error}] = useMutation(CREATE_GAME, {
		onCompleted: callback
	});
	return {
		createGame: async (password) => {
			const response = await createGame({variables: {worldId: currentWorld._id, password: password}});
			return response.data.createGame;
		},
		game: data ? data.createGame : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		loading
	};
}