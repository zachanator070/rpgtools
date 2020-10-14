import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import {CURRENT_WORLD_FOLDERS} from "../../../../common/src/gql-fragments";

export const IMPORT_CONTENT = gql`
	mutation importContent($folderId: ID!, $zipFile: Upload!){
		importContent(folderId: $folderId, zipFile: $zipFile){
			_id
			folders{
				${CURRENT_WORLD_FOLDERS}
			}
			rootFolder{
				${CURRENT_WORLD_FOLDERS}
			}
		}
	}
`;
export const useImportContent = () => {
	return useGQLMutation(IMPORT_CONTENT);
}