import {useMutation} from "@apollo/react-hooks";
import gql from "graphql-tag";

const CREATE_IMAGE = gql`
	mutation createImage($file: Upload!, $worldId: ID!, $chunkify: Boolean){
		createImage(file: $file, worldId: $worldId, chunkify: $chunkify){
			_id
		}
	}
`;

export const useCreateImage = async () => {
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