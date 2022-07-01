import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {MOVE_FOLDER} from "@rpgtools/common/src/gql-mutations";

interface MoveFolderVariables {
	folderId: string;
	parentFolderId: string;
}

interface MoveFolderResult extends GqlMutationResult<World, MoveFolderVariables> {
	moveFolder: MutationMethod<World, MoveFolderVariables>
}
export const useMoveFolder = (callback?: (data: World) => Promise<void>): MoveFolderResult => {
	const result = useGQLMutation<World, MoveFolderVariables>(
		MOVE_FOLDER,
		{},
		{ onCompleted: callback, displayErrors: false }
	);

	return {
		...result,
		moveFolder: result.mutate
	}
};
