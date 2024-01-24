import { DocumentNode, MutationHookOptions, useMutation } from "@apollo/client";
import useGQLResponse from "./useGQLResponse";
import { GQLResult } from "./types";
import getQueryName from "./getQueryName";

export interface GqlMutationResult<TData, TVariables = void> extends GQLResult<TData> {
	mutate: MutationMethod<TData, TVariables>;
}

export type MutationMethod<TData, TVariables> = (
	variables?: TVariables,
	// options?: MutationHookOptions<TData, TVariables>,
) => Promise<TData>;

interface GqlMutationUpdateSideEffect<TData, TVariables> {
	query: DocumentNode;
	variablesUsed: (newData: TData) => TVariables;
	update: (newData: TData, oldData: TData) => TData;
}

interface GqlMutationOptions<TEntity, TData, TVariables> {
	refetchQueries?: DocumentNode[];
	update?: GqlMutationUpdateSideEffect<TData, TVariables>;
	displayErrors?: boolean;
	onCompleted?: (data: TEntity) => void;
}
export default function useGQLMutation<TEntity, TData, TVariables = void>(
	query: DocumentNode,
	variables?: Partial<TVariables>,
	options: GqlMutationOptions<TEntity, TData, TVariables> = { displayErrors: true },
): GqlMutationResult<TEntity, TVariables> {
	const apolloOptions: MutationHookOptions<TData, TVariables> = {
		refetchQueries: options.refetchQueries,
	};
	if (options.update) {
		apolloOptions.update = async (cache, { data: newData }) => {
			const newPayload = newData[getQueryName(options.update.query)];
			await cache.updateQuery(
				{ query: options.update.query, variables: options.update.variablesUsed(newPayload) },
				(oldData) => {
					return options.update.update(newPayload, oldData);
				},
			);
		};
	}
	const [mutation, { data, loading, error }] = useMutation<TData, TVariables>(query, apolloOptions);

	const response = useGQLResponse<TEntity, TData>(query, data, error, options.displayErrors);
	return {
		...response,
		loading,
		mutate: async (
			givenVariables?: TVariables,
			options?: MutationHookOptions<TData, TVariables>,
		) => {
			const combinedVariables: TVariables = { ...variables, ...givenVariables };
			const result = await mutation({ variables: combinedVariables, ...options });
			return result.data[response.queryName];
		},
	};
}
