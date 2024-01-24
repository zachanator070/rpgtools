import { WikiPage, WikiPagePaginatedResult } from "../../types";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import { WIKIS_IN_FOLDER } from "@rpgtools/common/src/gql-queries";
import useFetchAllPagesEffect from "../useFetchAllPagesEffect";

interface WikisInFolderVariables {
	folderId: string;
	page?: number;
}

interface WikisInFolderData {
	wikisInFolder: WikiPagePaginatedResult;
}

interface WikisInFolderResult
	extends WikisInFolderData,
		GqlQueryResult<WikiPagePaginatedResult, WikisInFolderVariables> {}

export default function useWikisInFolder(variables?: WikisInFolderVariables): WikisInFolderResult {
	const result = useGQLQuery<WikisInFolderData, WikisInFolderVariables>(WIKIS_IN_FOLDER, variables);
	useFetchAllPagesEffect<WikiPage, WikisInFolderResult, WikisInFolderVariables>(
		result,
		WIKIS_IN_FOLDER,
		variables,
	);
	return {
		...result,
		wikisInFolder: result.data,
	};
}
