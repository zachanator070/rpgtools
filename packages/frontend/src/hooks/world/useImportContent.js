import { useGQLMutation } from "../useGQLMutation";
import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "../../../../common/src/gql-fragments";

export const IMPORT_CONTENT = gql`
	${CURRENT_WORLD_FOLDERS}
	mutation importContent($folderId: ID!, $zipFile: Upload!){
		importContent(folderId: $folderId, zipFile: $zipFile){
			_id
			rootFolder{
				...currentWorldFolders
			}
		}
	}
`;
export const useImportContent = () => {
	return useGQLMutation(IMPORT_CONTENT);
};
