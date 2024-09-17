import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation";
import {WikiFolder} from "../../types";
import {RENAME_FOLDER} from "@rpgtools/common/src/gql-mutations";

interface RenameFolderVariables {
	folderId: string;
	name: string;
}

interface RenameFolderResult extends GqlMutationResult<WikiFolder, RenameFolderVariables>{
	renameFolder: MutationMethod<WikiFolder, RenameFolderVariables>;
}

export default function useRenameFolder(): RenameFolderResult {
	const result = useGQLMutation<WikiFolder, RenameFolderVariables>(RENAME_FOLDER);
	return {
		...result,
		renameFolder: result.mutate
	};
};
