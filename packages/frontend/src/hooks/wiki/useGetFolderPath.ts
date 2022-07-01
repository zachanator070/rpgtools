import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";
import {WikiFolder} from "../../types";
import {GET_FOLDER_PATH} from "@rpgtools/common/src/gql-queries";

interface GetFolderPathVariables {
	wikiId: string;
}

interface GetFolderPathResult extends GqlQueryResult<WikiFolder[], GetFolderPathVariables>{
	getFolderPath: WikiFolder[]
}

export const useGetFolderPath = (variables?: GetFolderPathVariables): GetFolderPathResult => {
	const result = useGQLQuery<WikiFolder[], GetFolderPathVariables>(GET_FOLDER_PATH, variables);
	return {
		...result,
		getFolderPath: result.data
	};
};
