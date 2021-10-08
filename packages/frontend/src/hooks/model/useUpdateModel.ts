import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { MODEL_ATTRIBUTES } from "../gql-fragments";

export const UPDATE_MODEL = gql`
	${MODEL_ATTRIBUTES}
	mutation updateModel($modelId: ID!, $name: String!, $file: Upload, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		updateModel(modelId: $modelId, name: $name, file: $file, depth: $depth, width: $width, height: $height, notes: $notes){
			...modelAttributes
		}
	}
`;
export default () => {
	const [updateModel, { data, loading, error }] = useMutation(UPDATE_MODEL);
	return {
		updateModel: async (modelId, name, file, depth, width, height, notes) => {
			await updateModel({
				variables: {
					modelId,
					name,
					file,
					depth: parseFloat(depth),
					width: parseFloat(width),
					height: parseFloat(height),
					notes,
				},
			});
		},
		loading,
		errors: error ? error.graphQLErrors.map((error) => error.message) : [],
		model: data ? data.updateModel : null,
	};
};
