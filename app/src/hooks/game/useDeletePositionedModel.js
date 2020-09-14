import {useGQLMutation} from "../useGQLMutation";
import {DELETE_POSITIONED_MODEL} from "../../../../common/src/gql-queries";

export const useDeletePositionedModel = () => {
	return useGQLMutation(DELETE_POSITIONED_MODEL, {});
};