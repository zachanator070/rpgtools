import {CREATE_MODEL} from "../../../common/src/gql-queries";
import useCurrentWorld from "./useCurrentWorld";
import {useGQLMutation} from "./useGQLMutation";
import {useGetModels} from "./useGetModels";
import {useMyPermissions} from "./useMyPermissions";

export const useCreateModel = (callback) => {
	const {currentWorld} = useCurrentWorld();
	const {refetch} = useGetModels();
	const {reftch: refetchPermissions} = useMyPermissions();
	return useGQLMutation(CREATE_MODEL, {worldId: currentWorld._id}, {onCompleted: async (data) => {
		await refetch();
		await refetchPermissions();
		await callback(data);
	}});

};