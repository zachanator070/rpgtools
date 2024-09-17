import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {FOLDERS} from "@rpgtools/common/src/gql-queries";
import {DELETE_FOLDER} from "@rpgtools/common/src/gql-mutations";

interface DeleteFolderVariables {
	folderId: string;
}

interface DeleteFolderResult {
	deleteFolder: MutationMethod<World, DeleteFolderVariables>
}

export default function useDeleteFolder(): DeleteFolderResult {
	const result = useGQLMutation<World, DeleteFolderVariables>(DELETE_FOLDER, undefined, {
		refetchQueries: [FOLDERS]
	});
	return {
		...result,
		deleteFolder: result.mutate
	};
};
