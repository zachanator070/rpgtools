import useGQLQuery, {GqlQueryResult} from "../useGQLQuery.js";
import {WikiFolder} from "../../types.js";
import {GET_FOLDER_PATH} from "@rpgtools/common/src/gql-queries.js";

interface GetFolderPathVariables {
	wikiId: string;
}

interface GetFolderPathResult extends GqlQueryResult<WikiFolder[], GetFolderPathVariables>{
	getFolderPath: WikiFolder[]
}

export default function useGetFolderPath(variables?: GetFolderPathVariables): GetFolderPathResult {
	const result = useGQLQuery<WikiFolder[], GetFolderPathVariables>(GET_FOLDER_PATH, variables);
	return {
		...result,
		getFolderPath: result.data
	};
};
