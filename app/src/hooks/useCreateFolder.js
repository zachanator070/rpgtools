import {useMutation} from "@apollo/react-hooks";
import {CREATE_FOLDER} from "../../../common/src/gql-queries";

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