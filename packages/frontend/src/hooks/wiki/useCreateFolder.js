import {useMutation} from "@apollo/client";
import gql from "graphql-tag";

export const CREATE_FOLDER = gql`
	mutation createFolder($parentFolderId: ID!, $name: String!){
		createFolder(parentFolderId: $parentFolderId, name: $name){
			_id
		}
	}
`;
export default () => {
	const [createFolder, {loading, error, data}] = useMutation(CREATE_FOLDER);
	return {
		createFolder: async (parentFolderId, name) => {
			await createFolder({variables: {parentFolderId, name}});
		},
		loading,
		errors: error ? error.graphQLErrors.map(error => error.message) : [],
		world: data ? data.createFolder : null
	}
}