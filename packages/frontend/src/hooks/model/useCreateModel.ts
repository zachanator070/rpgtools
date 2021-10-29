import {GqlMutationResult, MutationMethod, useGQLMutation} from "../useGQLMutation";
import { useGetModels } from "./useGetModels";
import { useMyPermissions } from "../authorization/useMyPermissions";
import gql from "graphql-tag";
import {Model, World} from "../../types";
import useCurrentWorld from "../world/useCurrentWorld";

export const CREATE_MODEL = gql`
	mutation createModel(
		$name: String!
		$file: Upload!
		$worldId: ID!
		$depth: Float!
		$width: Float!
		$height: Float!
		$notes: String
	) {
		createModel(
			name: $name
			file: $file
			worldId: $worldId
			depth: $depth
			width: $width
			height: $height
			notes: $notes
		) {
			_id
		}
	}
`;

interface CreateModelVariables {
	name: string;
	file: any;
	worldId: string;
	depth: number;
	width: number;
	height: number;
	notes: string;
}

interface CreateModelResult extends GqlMutationResult<Model, CreateModelVariables>{
	createModel: MutationMethod<Model, CreateModelVariables>
}
export const useCreateModel = (callback: (data: Model) => Promise<void>): CreateModelResult => {
	const { refetch } = useGetModels();
	const {currentWorld} = useCurrentWorld();
	const { refetch: refetchPermissions } = useMyPermissions();
	const result = useGQLMutation<Model, CreateModelVariables>(
		CREATE_MODEL,
		{},
		{
			onCompleted: async (data: Model) => {
				await refetch({worldId: currentWorld._id});
				await refetchPermissions({worldId: currentWorld._id});
				await callback(data);
			},
		}
	);
	return {
		...result,
		createModel: result.mutate
	}
};
