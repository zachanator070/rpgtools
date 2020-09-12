import {CREATE_MODEL} from "../../../../common/src/gql-queries";
import {useGQLMutation} from "../useGQLMutation";
import {useGetModels} from "./useGetModels";
import {useMyPermissions} from "../authorization/useMyPermissions";

export const useCreateModel = (callback) => {
	const {refetch} = useGetModels();
	const {refetch: refetchPermissions} = useMyPermissions();
	return useGQLMutation(CREATE_MODEL, {}, {onCompleted: async (data) => {
		await refetch();
		await refetchPermissions();
		await callback(data);
	}});

};