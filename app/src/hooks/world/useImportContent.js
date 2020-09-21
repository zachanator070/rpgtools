import {useGQLMutation} from "../useGQLMutation";
import {IMPORT_CONTENT} from "../../../../common/src/gql-queries";

export const useImportContent = () => {
	return useGQLMutation(IMPORT_CONTENT);
}