import {useGetModels} from "./useGetModels";
import {useMyPermissions} from "./useMyPermissions";
import {useGQLMutation} from "./useGQLMutation";
import {DELETE_MODEL} from "../../../common/src/gql-queries";
import {useParams} from 'react-router-dom';


export const useDeleteModel = (callback) => {
	const {refetch} = useGetModels();
	const {refetch: refetchPermissions} = useMyPermissions();
	const params = useParams();

	return useGQLMutation(DELETE_MODEL, {modelId: params.model_id}, {onCompleted: async () => {
			await refetch();
			await refetchPermissions();
			callback();
		}, displayErrors: true});
};