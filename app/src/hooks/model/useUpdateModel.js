import {useMutation} from "@apollo/client";
import {UPDATE_MODEL} from "../../../../common/src/gql-queries";

export default () => {
	const [updateModel, {data, loading, error}] = useMutation(UPDATE_MODEL);
	return {
		updateModel: async (modelId, name, file, depth, width, height, notes) => {
			await updateModel({variables: {modelId, name, file, depth: parseFloat(depth), width: parseFloat(width), height: parseFloat(height), notes}})
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		model: data ? data.updateModel : null
	}
};