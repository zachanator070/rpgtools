import gql from "graphql-tag";
import {useMutation} from "@apollo/react-hooks";

const SET_CURRENT_WORLD = gql`
    mutation setCurrentWorld($worldId: ID!){
        setCurrentWorld(worldId: $worldId) @client
        setCurrentWorld(worldId: $worldId){
            _id
        }
    }
`;

export default () => {
	const [setCurrentWorld, {data, loading, error}] = useMutation(SET_CURRENT_WORLD);
	return {
		setCurrentWorld: async (worldId) => {await setCurrentWorld({variables: {worldId}})},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.setCurrentWorld : null
	};
}
