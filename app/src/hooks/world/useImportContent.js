import {useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";

export const IMPORT_CONTENT = gql`
	mutation importContent($worldId: ID!, $zipFile: Upload!){
		importContent(worldId: $worldId, zipFile: $zipFile)
	}
`;
export const useImportContent = () => {
	return useGQLMutation(IMPORT_CONTENT);
}