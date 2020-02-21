import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const RENAME_FOLDER = gql`
	mutation renameFolder($folderId: ID!, $name: String!){
		renameFolder(folderId: $folderId, name: $name){
			_id
			name
		}
	}
`;

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