import { useMutation } from "@apollo/client";
import gql from "graphql-tag";

export const DELETE_FOLDER = gql`
	mutation deleteFolder($folderId: ID!) {
		deleteFolder(folderId: $folderId) {
			_id
		}
	}
`;
export const useDeleteFolder = () => {
	const [deleteFolder, { data, loading, error }] = useMutation(DELETE_FOLDER);
	return {
		deleteFolder: async (folderId) => {
			await deleteFolder({ variables: { folderId } });
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		world: data ? data.deleteFolder : null,
	};
};
