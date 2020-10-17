import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {CURRENT_WORLD_FOLDERS} from "@rpgtools/common/src/gql-fragments";

export const MOVE_FOLDER = gql`
	mutation moveFolder($folderId: ID!, $parentFolderId: ID!){
		moveFolder(folderId: $folderId, parentFolderId: $parentFolderId){
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
`;
export const useMoveFolder = (callback) => {
	return useGQLMutation(MOVE_FOLDER, {}, {onCompleted: callback, displayErrors: false});
};