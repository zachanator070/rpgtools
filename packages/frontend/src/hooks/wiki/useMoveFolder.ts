import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {World} from "../../types";

export const MOVE_FOLDER = gql`
	mutation moveFolder($folderId: ID!, $parentFolderId: ID!) {
		moveFolder(folderId: $folderId, parentFolderId: $parentFolderId) {
			_id
		}
	}
`;

interface MoveFolderVariables {
	folderId: string;
	parentFolderId: string;
}

interface MoveFolderResult {
	moveFolder: MutationMethod<World, MoveFolderVariables>
}
export const useMoveFolder = (callback: (data: World) => Promise<void>): MoveFolderResult => {
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
