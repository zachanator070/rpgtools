import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";

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

export const useFolders = (variables) => {
	return useGQLQuery(FOLDERS, variables);
};
