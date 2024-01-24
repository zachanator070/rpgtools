import { DocumentNode, useLazyQuery } from "@apollo/client";
import useGQLResponse from "./useGQLResponse";
// extends GqlQueryResult<TData, TVariables>
export interface GqlLazyHookResult<TData, TVariables = void> {
	loading: boolean;
	refetch: LazyHookFetch<TData, TVariables>;
	fetch: LazyHookFetch<TData, TVariables>;
	fetchMore: LazyHookFetch<TData, TVariables>;
	data: TData;
}

export type LazyHookFetch<TData, TVariables> = (variables?: TVariables) => Promise<TData>;
type UpdateQuery<TData> = (prev, { fetchMoreResult }) => TData;
type LazyQueryOptions<TData> = {
	onCompleted?: () => void;
	displayErrors?: boolean;
	updateQuery?: UpdateQuery<TData>;
};
export default function useGQLLazyQuery<TData, TVariables = void>(
	query: DocumentNode,
	variables: TVariables = null,
	options: LazyQueryOptions<TData> = { displayErrors: true },
): GqlLazyHookResult<TData, TVariables> {
	const [fetch, { data, loading, error, refetch, fetchMore }] = useLazyQuery<TData>(query, {
		variables,
		onCompleted: options.onCompleted,
	});
	const response = useGQLResponse<TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		refetch: async (newVariables?: TVariables) => {
			const originalVariables = { ...variables };
			return (await refetch({ ...originalVariables, ...newVariables })).data;
		},
		fetchMore: async (variables: TVariables) => {
			return (await fetchMore({ variables, updateQuery: options.updateQuery })).data;
		},
		fetch: async (variables) => (await fetch({ variables })).data,
	};
}
