import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {Image} from "../../types";

export const CREATE_IMAGE = gql`
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean) {
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify) {
			_id
		}
	}
`;

interface CreateImageVariables {
	file: any;
	worldId: string;
	chunkify: boolean;
}

interface CreateImageResult {
	createImage: MutationMethod<Image, CreateImageVariables>;
}

export const useCreateImage = (): CreateImageResult => {
	const result = useGQLMutation<Image, CreateImageVariables>(CREATE_IMAGE);
	return {
		...result,
		createImage: result.mutate,
	};
};
