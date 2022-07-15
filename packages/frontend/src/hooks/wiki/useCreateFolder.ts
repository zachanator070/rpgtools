import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {World} from "../../types";
import {CREATE_FOLDER} from "@rpgtools/common/src/gql-mutations";

interface CreateFolderVariables {
	parentFolderId: string;
	name: string;
}

interface CreateFolderResult {
	createFolder: MutationMethod<World, CreateFolderVariables>
}

export default function useCreateFolder(): CreateFolderResult {
	const result = useGQLMutation<World, CreateFolderVariables>(CREATE_FOLDER);
	return {
		...result,
		createFolder: result.mutate
	};
};
