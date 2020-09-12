import {useGQLMutation} from "../useGQLMutation";
import {ADD_MODEL} from "../../../../common/src/gql-queries";

export const useAddModel = () => {
	return useGQLMutation(ADD_MODEL, {});
};