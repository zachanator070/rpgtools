import {useEffect} from "react";
import {WikiPagePaginatedResult} from "../../types";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";

interface WikisInFolderVariables {
	folderId?: string;
	page?: number;
}

interface WikisInFolderResult extends GqlQueryResult<WikiPagePaginatedResult, WikisInFolderVariables>{
	wikisInFolder: WikiPagePaginatedResult;
}

export default function useWikisInFolder(variables?: WikisInFolderVariables): WikisInFolderResult {
	const result = useGQLQuery<WikiPagePaginatedResult, WikisInFolderVariables>(WIKIS_IN_FOLDER, variables);
	useEffect(() => {
		if (result.data && result.data.nextPage) {
			(async () => {
				await result.fetchMore(
					{
						variables: {
							...variables,
							page: result.data.nextPage,
						}
					},
				);
			})();
		}
	}, [result.data]);
	return {
		...result,
		wikisInFolder: result.data,
	};
};
