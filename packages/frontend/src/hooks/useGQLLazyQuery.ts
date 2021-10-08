import {DocumentNode, useLazyQuery, useQuery} from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";
import {ApiHookResponse} from "./types";
import {GqlQueryResult} from "./useGQLQuery";

export interface GqlLazyHookResult<TData, TVariables=void> extends GqlQueryResult<TData, TVariables>{
	fetch: LazyHookFetch<TVariables>;
}

export type LazyHookFetch<TVariables> = (variables: TVariables) => Promise<void>;

export const useGQLLazyQuery = <TData, TVariables=void>(
	query: DocumentNode,
	variables: any = null,
	options = { onCompleted: () => {}, displayErrors: true }
): GqlLazyHookResult<TData, TVariables> => {
	const [
		fetch,
		{ data, loading, error, refetch, fetchMore },
	] = useLazyQuery<TData>(query, { variables, onCompleted: options.onCompleted });
	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch,
		fetchMore,
		fetch: async (variables) => fetch({ variables })
	};
};
