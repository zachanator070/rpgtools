import {useParams} from "react-router-dom";
import useGQLQuery, { GqlQueryResult } from "../useGQLQuery";
import {GET_TOKEN_ICONS} from "@rpgtools/common/src/gql-queries";
import { useEffect } from "react";
import { TokenIconPaginatedResult } from "../../types";

interface TokenIconsResult extends GqlQueryResult<TokenIconPaginatedResult, TokenIconsVariables>{
	tokenIcons: TokenIconPaginatedResult;
}

interface TokenIconsVariables {
	worldId: string;
	page?: number;
}

export default function useTokenIcons(page?: number) {
	const { world_id } = useParams();
	const variables: TokenIconsVariables = {
		worldId: world_id,
	};
	if (page) {
		variables.page = page;
	}

	const result = useGQLQuery<TokenIconPaginatedResult, TokenIconsVariables>(
		GET_TOKEN_ICONS,
		variables
	);

	useEffect(() => {
			if (result.data && result.data.nextPage) {
				(async () => {
					const more = await result.fetchMore(
						{
							variables: {
								...variables,
								page: result.data.nextPage,
							},
							updateQuery: (previousResultQuery: TokenIconsResult, options: {fetchMoreResult: TokenIconsResult}) => {
								const newResult = {
									tokenIcons: {
										...options.fetchMoreResult.tokenIcons,
										docs: [...previousResultQuery.tokenIcons.docs, ...options.fetchMoreResult.tokenIcons.docs],
									}
								};
								return newResult;
							}
						},
					);
				})();
			}
		}, [result.data]);

	return {
		...result,
		data: result.data,
	};
}
