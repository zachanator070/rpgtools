import gql from "graphql-tag";
import { useGQLQuery } from "../useGQLQuery";
import {WikiFolder} from "../../types";

const GET_FOLDER_PATH = gql`
	query getFolderPath($wikiId: ID!) {
		getFolderPath(wikiId: $wikiId) {
			_id
			name
		}
	}
`;
interface GetFolderPathVariables {
	wikiId: string;
}

interface GetFolderPathResult {
	getFolderPath: WikiFolder[]
}

export const useGetFolderPath = (variables: GetFolderPathVariables): GetFolderPathResult => {
	const result = useGQLQuery<WikiFolder[], GetFolderPathVariables>(GET_FOLDER_PATH, variables);
	return {
		...result,
		getFolderPath: result.data
	};
};
