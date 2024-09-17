import {useEffect} from "react";
import {WikiPagePaginatedResult} from "../../types";
import useGQLQuery, {GqlQueryResult} from "../useGQLQuery";
import {WIKIS_IN_FOLDER} from "@rpgtools/common/src/gql-queries";

interface WikisInFolderVariables {
	folderId: string;
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
				const more = await result.fetchMore(
					{
						variables: {
							...variables,
							page: result.data.nextPage,
						},
						updateQuery: (previousResultQuery: WikisInFolderResult, options: {fetchMoreResult: WikisInFolderResult}) => {
							const newResult = {
								wikisInFolder: {
									docs: [],
									nextPage: options.fetchMoreResult.wikisInFolder.nextPage
								}
							};
							newResult.wikisInFolder.docs.push(...previousResultQuery.wikisInFolder.docs);
							newResult.wikisInFolder.docs.push(...options.fetchMoreResult.wikisInFolder.docs);
							return newResult;
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
