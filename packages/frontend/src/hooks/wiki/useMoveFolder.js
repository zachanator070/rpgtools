import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";

export const MOVE_FOLDER = gql`
	mutation moveFolder($folderId: ID!, $parentFolderId: ID!){
		moveFolder(folderId: $folderId, parentFolderId: $parentFolderId){
			_id
		}
	}
`;
export const useMoveFolder = (callback) => {
	return useGQLMutation(MOVE_FOLDER, {}, {onCompleted: callback, displayErrors: false});
};