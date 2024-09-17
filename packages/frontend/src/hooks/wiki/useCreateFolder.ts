import useGQLMutation, {MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {CREATE_FOLDER} from "@rpgtools/common/src/gql-mutations.js";
import {FOLDERS} from "@rpgtools/common/src/gql-queries.js";

interface CreateFolderVariables {
	parentFolderId: string;
	name: string;
}

interface CreateFolderResult {
	createFolder: MutationMethod<World, CreateFolderVariables>
}

export default function useCreateFolder(): CreateFolderResult {
	const result = useGQLMutation<World, CreateFolderVariables>(CREATE_FOLDER, {}, {refetchQueries: [FOLDERS]});
	return {
		...result,
		createFolder: result.mutate
	};
};
