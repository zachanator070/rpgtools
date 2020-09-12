import {useGQLMutation} from "../useGQLMutation";
import {MOVE_FOLDER} from "../../../../common/src/gql-queries";

export const useMoveFolder = (callback) => {
	return useGQLMutation(MOVE_FOLDER, {}, {onCompleted: callback, displayErrors: false});
};