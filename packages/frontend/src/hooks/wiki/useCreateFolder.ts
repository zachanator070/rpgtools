import gql from "graphql-tag";
import {MutationMethod, useGQLMutation} from "../useGQLMutation";
import {World} from "../../types";

export const CREATE_FOLDER = gql`
	mutation createFolder($parentFolderId: ID!, $name: String!) {
		createFolder(parentFolderId: $parentFolderId, name: $name) {
			_id
		}
	}
`;

interface CreateFolderVariables {
	parentFolderId: string;
	name: string;
}

interface CreateFolderResult {
	createFolder: MutationMethod<World, CreateFolderVariables>
}

export default (): CreateFolderResult => {
	const result = useGQLMutation<World, CreateFolderVariables>(CREATE_FOLDER);
	return {
		...result,
		createFolder: result.mutate
	};
};
