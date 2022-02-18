import gql from "graphql-tag";
import { CURRENT_WORLD_WIKIS } from "../gql-fragments";
import {GqlLazyHookResult, useGQLLazyQuery} from "../useGQLLazyQuery";
import { useEffect } from "react";
import {WikiPagePaginatedResult} from "../../types";
import {GqlQueryResult, useGQLQuery} from "../useGQLQuery";

export const WIKIS_IN_FOLDER = gql`
	${CURRENT_WORLD_WIKIS}
	query wikisInFolder($folderId: ID!, $page: Int){
		wikisInFolder(folderId: $folderId, page: $page){
			docs{
				...currentWorldWikis
				folder{
					_id
					name
				}
				world{
					_id
				}
			}
			nextPage
		}
	}
`;

interface WikisInFolderVariables {
	folderId?: string;
	page?: number;
}

interface WikisInFolderResult extends GqlQueryResult<WikiPagePaginatedResult, WikisInFolderVariables>{
	wikisInFolder: WikiPagePaginatedResult;
}

export const useWikisInFolder = (variables?: WikisInFolderVariables): WikisInFolderResult => {
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
