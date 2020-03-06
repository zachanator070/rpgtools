import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const RENAME_WORLD = gql`
	mutation renameWorld($worldId: ID!, $newName: String!){
		renameWorld(worldId: $worldId, newName: $newName){
			_id
			name
		}
	}
`;

export const useRenameWorld = () => {
	const [renameWorld, {data, loading, error}] = useMutation(RENAME_WORLD);
	return {
		renameWorld: async (worldId, newName) => {
			await renameWorld({variables: {worldId, newName}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.renameWorld : null
	}
};