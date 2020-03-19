import {useMutation} from "@apollo/react-hooks";
import {DELETE_FOLDER} from "../../../common/src/gql-queries";

export const useDeleteFolder = () => {
	const [deleteFolder, {data, loading, error}] = useMutation(DELETE_FOLDER);
	return {
		deleteFolder: async (folderId) => {await deleteFolder({variables: {folderId}});},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.deleteFolder : null
	}
};