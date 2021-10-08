import { useGQLMutation } from "../useGQLMutation";
import { useGetModels } from "./useGetModels";
import { useMyPermissions } from "../authorization/useMyPermissions";
import gql from "graphql-tag";

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
export const useCreateModel = (callback) => {
	const { refetch } = useGetModels();
	const { refetch: refetchPermissions } = useMyPermissions();
	return useGQLMutation(
		CREATE_MODEL,
		{},
		{
			onCompleted: async (data) => {
				await refetch();
				await refetchPermissions();
				await callback(data);
			},
		}
	);
};
