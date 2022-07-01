import {DocumentNode, LazyQueryResult, useLazyQuery} from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";
import {GqlQueryResult} from "./useGQLQuery";
// extends GqlQueryResult<TData, TVariables>
export interface GqlLazyHookResult<TData, TVariables=void>  {
	loading: boolean;
	refetch: LazyHookFetch<TData, TVariables>;
	fetch: LazyHookFetch<TData, TVariables>;
	fetchMore: LazyHookFetch<TData, TVariables>;
	data: TData;
}

export type LazyHookFetch<TData, TVariables> = (variables?: TVariables) => Promise<any>;
type UpdateQuery = (prev, {fetchMoreResult}) => any;
type LazyQueryOptions = {
	onCompleted?: () => void;
	displayErrors?: boolean;
	updateQuery?: UpdateQuery;
}
export const useGQLLazyQuery = <TData, TVariables=void>(
	query: DocumentNode,
	variables: any = null,
	options: LazyQueryOptions = { displayErrors: true }
): GqlLazyHookResult<TData, TVariables> => {
	const [
		fetch,
		{ data, loading, error, refetch, fetchMore },
	] = useLazyQuery<TData>(query, { variables, onCompleted: options.onCompleted });
	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch: async (newVariables?: TVariables) => {
			const originalVariables = Object.create(variables);
			return await refetch(Object.assign(originalVariables, newVariables));
		},
		fetchMore: async (variables: TVariables) => { await fetchMore({variables, updateQuery: options.updateQuery}) },
		fetch: async (variables) => fetch({ variables })
	};
};
