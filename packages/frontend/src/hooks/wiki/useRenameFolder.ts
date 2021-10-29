import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {WikiFolder} from "../../types";

export const RENAME_FOLDER = gql`
	mutation renameFolder($folderId: ID!, $name: String!) {
		renameFolder(folderId: $folderId, name: $name) {
			_id
			name
		}
	}
`;

interface RenameFolderVariables {
	folderId: string;
	name: string;
}

interface RenameFolderResult {
	renameFolder: MutationMethod<WikiFolder, RenameFolderVariables>;
}

export const useRenameFolder = (): RenameFolderResult => {
	const result = useGQLMutation<WikiFolder, RenameFolderVariables>(RENAME_FOLDER);
	return {
		...result,
		renameFolder: result.mutate
	};
};
