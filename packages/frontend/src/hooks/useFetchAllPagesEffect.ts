import { DocumentNode } from "@apollo/client";
import getQueryName from "./getQueryName";
import { useEffect } from "react";
import { PaginatedResult } from "../types";
import { GqlQueryResult } from "./useGQLQuery";

export interface PaginatedQueryVariables {
	page?: number;
}

export default function useFetchAllPagesEffect<
	TPaginated,
	TEntity extends PaginatedResult<TPaginated>,
	TData,
	TResult extends GqlQueryResult<TEntity, TData, TVariables>,
	TVariables extends PaginatedQueryVariables,
>(result: TResult, query: DocumentNode, variables: TVariables) {
	const queryName = getQueryName(query);
	useEffect(() => {
		if (result.data && result.data.nextPage) {
			(async () => {
				await result.fetchMore({
					variables: {
						...variables,
						page: result.data.nextPage,
					},
					updateQuery: (previousResultQuery, options: { fetchMoreResult }) => {
						const newResult: TData = { ...previousResultQuery };
						newResult[queryName] = {
							docs: [],
							nextPage: options.fetchMoreResult[queryName].nextPage,
						};
						newResult[queryName].docs.push(...previousResultQuery[queryName].docs);
						newResult[queryName].docs.push(...options.fetchMoreResult[queryName].docs);
						return newResult;
					},
				});
			})();
		}
	}, [result.data]);
}
