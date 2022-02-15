import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import gql from "graphql-tag";
import { CURRENT_WORLD_FOLDERS } from "../gql-fragments";
import {World} from "../../types";

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

interface ImportContentVariables {
	folderId: string;
	zipFile: any;
}

interface ImportContentResult extends GqlMutationResult<World, ImportContentVariables>{
	importContent: MutationMethod<World, ImportContentVariables>;
}

export const useImportContent = (): ImportContentResult => {
	const result = useGQLMutation<World, ImportContentVariables>(IMPORT_CONTENT);
	return {
		...result,
		importContent: result.mutate
	};
};
