import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const DELETE_FOLDER = gql`
	mutation deleteFolder($folderId: ID!){
		deleteFolder(folderId: $folderId){
			_id
		}
	}
`;

export const useDeleteFolder = async () => {
	const [deleteFolder, {data, loading, error}] = useMutation(DELETE_FOLDER);
	return {
		deleteFolder: async (folderId) => {await deleteFolder({variables: {folderId}});},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		folder: data ? data.deleteFolder : null
	}
};