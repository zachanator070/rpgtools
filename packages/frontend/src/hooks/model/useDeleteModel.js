import {useGetModels} from "./useGetModels";
import {useMyPermissions} from "../authorization/useMyPermissions";
import {useGQLMutation} from "../useGQLMutation";
import {useParams} from 'react-router-dom';
import gql from "graphql-tag";


export const DELETE_MODEL = gql`
	mutation deleteModel($modelId: ID!){
		deleteModel(modelId: $modelId){
			_id
		}
	}
`;
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