import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";
import {IMPORT_CONTENT} from "@rpgtools/common/src/gql-mutations";

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
