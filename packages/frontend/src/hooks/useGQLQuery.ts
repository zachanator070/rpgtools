import {DocumentNode, useQuery} from "@apollo/client";
import useGQLResponse from "./useGQLResponse.js";
import {ApiHookResponse} from "./types.js";
import {ApolloQueryResult} from "@apollo/client/core";
import getQueryName from "./getQueryName.js";

export interface GqlQueryResult<TData, TVariables=void> extends ApiHookResponse<TData> {
	refetch: (variables?: TVariables) => Promise<TData>;
	fetchMore: ((fetchMoreOptions: {variables: TVariables, updateQuery?: (previousResultQuery: any, options: {fetchMoreResult: any}) => any}) => Promise<ApolloQueryResult<TData>>);
}

export default function useGQLQuery<TData, TVariables=void>(
	query: DocumentNode,
	variables: any = null,
	options = { onCompleted: () => {}, displayErrors: true }
): GqlQueryResult<TData, TVariables> {
	const { data, loading, error, refetch, fetchMore } = useQuery<TData, TVariables>(query, {
		variables,
		onCompleted: options.onCompleted,
	});
	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch: async (newVariables?: TVariables) => {
			const originalVariables = Object.create(variables);
			const result = await refetch(Object.assign(originalVariables, newVariables));
			return (result.data as any)[response.queryName]
		},
		fetchMore: async ({variables: moreVariables, updateQuery}) => fetchMore({variables: moreVariables, updateQuery})

	};
};
