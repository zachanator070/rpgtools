import {useMutation} from "@apollo/react-hooks";
import useCurrentUser from "./useCurrentUser";
import {SET_CURRENT_WORLD} from "../../../common/src/gql-queries";

export const useSetCurrentWorld = () => {
	const [setCurrentWorld, {loading}] = useMutation(SET_CURRENT_WORLD);
	const {refetch} = useCurrentUser();
	return {
		setCurrentWorld: async (world_id) => {
			await setCurrentWorld({variables: {worldId: world_id}});
			await refetch();
		},
		loading
	}
};