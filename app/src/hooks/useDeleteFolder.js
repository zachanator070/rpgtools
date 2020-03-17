import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";
import {CURRENT_WORLD_FOLDERS} from "./useCurrentWorld";

const DELETE_FOLDER = gql`
	mutation deleteFolder($folderId: ID!){
		deleteFolder(folderId: $folderId){
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
	
`;

export const useDeleteFolder = () => {
	const [deleteFolder, {data, loading, error}] = useMutation(DELETE_FOLDER);
	return {
		deleteFolder: async (folderId) => {await deleteFolder({variables: {folderId}});},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.deleteFolder : null
	}
};