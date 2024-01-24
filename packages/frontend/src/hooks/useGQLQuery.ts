import { DocumentNode, useQuery } from "@apollo/client";
import useGQLResponse from "./useGQLResponse";
import { GQLResult } from "./types";
import { ApolloQueryResult } from "@apollo/client/core";

export interface GqlQueryResult<TEntity, TData, TVariables> extends GQLResult<TEntity> {
	refetch: (variables?: TVariables) => Promise<TEntity>;
	fetchMore: (fetchMoreOptions: {
		variables: TVariables;
		updateQuery?: (previousResultQuery: TData, options: { fetchMoreResult: TData }) => TData;
	}) => Promise<ApolloQueryResult<TEntity>>;
}

export default function useGQLQuery<TEntity, TData, TVariables = void>(
	query: DocumentNode,
	variables: TVariables = null,
	options = { onCompleted: () => {}, displayErrors: true },
): GqlQueryResult<TEntity, TData, TVariables> {
	const { data, loading, error, refetch, fetchMore } = useQuery<TData, TVariables>(query, {
		variables,
		onCompleted: options.onCompleted,
	});
	const response = useGQLResponse<TEntity, TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch: async (newVariables?: TVariables) => {
			const mergedVariables = { ...variables, ...newVariables };
			const result = await refetch(mergedVariables);
			return result.data[response.queryName];
		},
		fetchMore: async ({ variables: moreVariables, updateQuery }) =>
			fetchMore({ variables: moreVariables, updateQuery })[response.queryName],
	};
}
