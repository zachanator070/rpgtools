import {useMutation} from "@apollo/client";
import {RENAME_WORLD} from "../../../../common/src/gql-queries";

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