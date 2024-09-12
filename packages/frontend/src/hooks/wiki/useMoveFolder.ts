import useGQLMutation, {GqlMutationResult, MutationMethod} from "../useGQLMutation.js";
import {World} from "../../types.js";
import {MOVE_FOLDER} from "@rpgtools/common/src/gql-mutations";
import {FOLDERS} from "@rpgtools/common/src/gql-queries";

interface MoveFolderVariables {
	folderId: string;
	parentFolderId: string;
}

interface MoveFolderResult extends GqlMutationResult<World, MoveFolderVariables> {
	moveFolder: MutationMethod<World, MoveFolderVariables>
}
export default function useMoveFolder(callback?: (data: World) => Promise<void>): MoveFolderResult {
	const result = useGQLMutation<World, MoveFolderVariables>(
		MOVE_FOLDER,
		{},
		{ onCompleted: callback, displayErrors: false, refetchQueries: [FOLDERS] }
	);

	return {
		...result,
		moveFolder: result.mutate
	}
};
