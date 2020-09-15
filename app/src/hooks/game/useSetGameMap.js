import {useMutation} from "@apollo/client";
import {SET_GAME_MAP} from "../../../../common/src/gql-queries";
import {useGQLMutation} from "../useGQLMutation";

export const useSetGameMap = () => {
	return useGQLMutation(SET_GAME_MAP);
};