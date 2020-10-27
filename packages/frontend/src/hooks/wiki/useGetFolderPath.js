import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";

const GET_FOLDER_PATH = gql`
	query getFolderPath($wikiId: ID!) {
		getFolderPath(wikiId: $wikiId) {
			_id
			name
		}
	}
`;

export const useGetFolderPath = (variables) => {
	return useGQLQuery(GET_FOLDER_PATH, variables);
};
