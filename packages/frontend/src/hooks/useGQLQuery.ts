import {DocumentNode, useQuery} from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";
import {ApiHookResponse} from "./types";
import {ApolloQueryResult} from "@apollo/client/core";

export interface GqlQueryResult<TData, TVariables=void> extends ApiHookResponse<TData> {
	refetch: (variables: TVariables) => Promise<ApolloQueryResult<TData>>;
	fetchMore: ((fetchMoreOptions: {variables: TVariables, updateQuery?: () => {}}) => Promise<ApolloQueryResult<TData>>);
}

export const useGQLQuery = <TData, TVariables=void>(
	query: DocumentNode,
	variables: any = null,
	options = { onCompleted: () => {}, displayErrors: true }
): GqlQueryResult<TData, TVariables> => {
	const { data, loading, error, refetch, fetchMore } = useQuery<TData, TVariables>(query, {
		variables,
		onCompleted: options.onCompleted,
	});
	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch,
		fetchMore,
	};
};
