import useGQLMutation, {MutationMethod} from "../useGQLMutation";
import {Image} from "../../types";
import {CREATE_IMAGE} from "@rpgtools/common/src/gql-mutations";

interface CreateImageVariables {
	file: any;
	worldId: string;
	chunkify: boolean;
}

interface CreateImageResult {
	createImage: MutationMethod<Image, CreateImageVariables>;
}

export default function useCreateImage(): CreateImageResult {
	const result = useGQLMutation<Image, CreateImageVariables>(CREATE_IMAGE);
	return {
		...result,
		createImage: result.mutate,
	};
};
