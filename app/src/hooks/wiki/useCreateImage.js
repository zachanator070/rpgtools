import {useMutation} from "@apollo/client";
import {CREATE_IMAGE} from "../../../../common/src/gql-queries";

export const useCreateImage = () => {
	const [createImage, {data, loading, error}] = useMutation(CREATE_IMAGE);
	return {
		createImage: async (file, worldId, chunkify) => {
			return await createImage({variables: {file, worldId, chunkify}});
		},
		loading,
		image: data ? data.createImage : null,
		errors: error ? error.graphQLErrors.map(error => error.message) : []
	}
};