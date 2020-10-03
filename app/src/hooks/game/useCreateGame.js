import {useMutation} from "@apollo/client";
import useCurrentWorld from "../world/useCurrentWorld";
import gql from "graphql-tag";
import {ACCESS_CONTROL_LIST} from "../../../../common/src/gql-fragments";

export const CREATE_GAME = gql`
    mutation createGame($worldId: ID!, $password: String){
        createGame(worldId: $worldId, password: $password){
            _id
            ${ACCESS_CONTROL_LIST}
        }
    }
`;
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