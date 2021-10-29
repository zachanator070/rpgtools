import gql from "graphql-tag";
import { CURRENT_WORLD_WIKIS } from "../gql-fragments";
import {GqlLazyHookResult, useGQLLazyQuery} from "../useGQLLazyQuery";
import { useEffect } from "react";
import {WikiPagePaginatedResult} from "../../types";

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
	folderId: string;
	page: number;
}

interface WikisInFolderResult extends GqlLazyHookResult<WikiPagePaginatedResult, WikisInFolderVariables>{
	wikisInFolder: WikiPagePaginatedResult;
}

export const useWikisInFolder = (variables: WikisInFolderVariables): WikisInFolderResult => {
	const updateQuery =
		(prev, { fetchMoreResult }) => {
		if (!fetchMoreResult) return prev;

		return {
			wikisInFolder: {
				docs: [...prev.wikisInFolder.docs, ...fetchMoreResult.wikisInFolder.docs],
				nextPage: fetchMoreResult.wikisInFolder.nextPage,
				__typename: "WikiPagePaginatedResult",
			},
		};
	};
	const result = useGQLLazyQuery<WikiPagePaginatedResult, WikisInFolderVariables>(WIKIS_IN_FOLDER, variables, {updateQuery});
	useEffect(() => {
		if (variables) {
			(async () => {
				await result.fetch(variables);
			})();
		}
	}, []);
	useEffect(() => {
		if (result.data && result.data.nextPage) {
			(async () => {
				await result.fetchMore(
					{
						...variables,
						page: result.data.nextPage,
					},
				);
			})();
		}
	}, [result.data]);
	return {
		...result,
		wikisInFolder: result.data,
		fetchMore: async (variables: WikisInFolderVariables) =>
			await result.fetchMore(variables)
	};
};
