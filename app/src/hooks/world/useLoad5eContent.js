import {useGQLMutation} from "../useGQLMutation";
import {LOAD_5E_CONTENT} from "../../../../common/src/gql-queries";

export const useLoad5eContent = () => {
	return useGQLMutation(LOAD_5E_CONTENT);
}