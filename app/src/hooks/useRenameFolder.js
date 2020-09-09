import {useMutation} from "@apollo/client";
import {RENAME_FOLDER} from "../../../common/src/gql-queries";

export const useRenameFolder = () => {
	const [renameFolder, {data, loading, error}] = useMutation(RENAME_FOLDER);
	return {
		renameFolder: async (folderId, name) => {
			await renameFolder({variables: {folderId, name}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		folder: data ? data.renameFolder : null
	}
};