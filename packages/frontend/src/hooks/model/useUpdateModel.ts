import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { MODEL_ATTRIBUTES } from "../gql-fragments";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Model} from "../../types";

export const UPDATE_MODEL = gql`
	${MODEL_ATTRIBUTES}
	mutation updateModel($modelId: ID!, $name: String!, $file: Upload, $depth: Float!, $width: Float!, $height: Float!, $notes: String){
		updateModel(modelId: $modelId, name: $name, file: $file, depth: $depth, width: $width, height: $height, notes: $notes){
			...modelAttributes
		}
	}
`;

interface UpdateModelVariables {
	modelId: string;
	name: string;
	file: any;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface UpdateModelResult {
	updateModel: MutationMethod<Model, UpdateModelVariables>;
	model: Model;
}

export default (): UpdateModelResult => {
	const result = useGQLMutation<Model, UpdateModelVariables>(UPDATE_MODEL)
	return {
		...result,
		updateModel: result.mutate,
		model: result.data
	};
};
