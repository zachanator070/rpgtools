import gql from "graphql-tag";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiFolder} from "../../types";

const FOLDERS = gql`
	query folders($worldId: ID!, $name: String, $canAdmin: Boolean) {
		folders(worldId: $worldId, name: $name, canAdmin: $canAdmin) {
			_id
			name
			children {
				_id
				name
			}
			canWrite
			canAdmin
		}
	}
`;

interface FoldersVariables {
	worldId: string;
	name?: string;
	canAdmin?: boolean;
}

interface FoldersResult extends GqlQueryResult<WikiFolder[], FoldersVariables>{
	folders: WikiFolder[]
}

export const useFolders = (variables: FoldersVariables): FoldersResult => {
	const result = useGQLQuery<WikiFolder[], FoldersVariables>(FOLDERS, variables);
	return {
		...result,
		folders: result.data
	};
};
