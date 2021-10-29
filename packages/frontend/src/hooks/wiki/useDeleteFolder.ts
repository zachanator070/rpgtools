import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const DELETE_FOLDER = gql`
	mutation deleteFolder($folderId: ID!) {
		deleteFolder(folderId: $folderId) {
			_id
		}
	}
`;

interface DeleteFolderVariables {
	folderId: string;
}

interface DeleteFolderResult {
	deleteFolder: MutationMethod<World, DeleteFolderVariables>
}

export const useDeleteFolder = (): DeleteFolderResult => {
	const result = useGQLMutation<World, DeleteFolderVariables>(DELETE_FOLDER);
	return {
		...result,
		deleteFolder: result.mutate
	};
};
