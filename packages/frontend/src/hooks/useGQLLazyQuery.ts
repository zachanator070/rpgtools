import {DocumentNode, useLazyQuery} from "@apollo/client";
import { useGQLResponse } from "./useGQLResponse";
import {GqlQueryResult} from "./useGQLQuery";
// extends GqlQueryResult<TData, TVariables>
export interface GqlLazyHookResult<TData, TVariables=void>  {
	loading: boolean;
	refetch: LazyHookFetch<TVariables>;
	fetch: LazyHookFetch<TVariables>;
	fetchMore: LazyHookFetch<TVariables>;
	data: TData;
}

export type LazyHookFetch<TVariables> = (variables: TVariables) => Promise<void>;
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
		refetch: async (variables: TVariables) => { await refetch({variables}) },
		fetchMore: async (variables: TVariables) => { await fetchMore({variables, updateQuery: options.updateQuery}) },
		fetch: async (variables) => fetch({ variables })
	};
};
